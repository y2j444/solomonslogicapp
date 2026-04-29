import { smsResponse } from "@/lib/twiml";
import { ContactStatus, SmsRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { handleSmsReceptionist } from "@/lib/sms-receptionist";

function formToRecord(form: FormData): Record<string, string> {
  const params: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") params[key] = value;
  }
  return params;
}

export async function POST(request: Request) {
  const form = await request.formData();
  const params = formToRecord(form);

  const from = params.From?.trim() ?? "";
  const inbound = params.Body?.trim() ?? "";
  const to = params.To?.trim() ?? "";

  if (!from || !to) {
    return new Response(smsResponse("Missing sender information."), {
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });
  }

  if (!inbound) {
    return new Response(smsResponse("Please send a text message."), {
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });
  }

  const user = await prisma.user.findFirst({ where: { twilioPhone: to } });
  if (!user) {
    return new Response(
      smsResponse("This number is not configured to a business profile yet."),
      { headers: { "Content-Type": "text/xml; charset=utf-8" } }
    );
  }

  let contact = await prisma.contact.findFirst({
    where: { ownerUserId: user.id, phone: from },
  });
  if (!contact) {
    contact = await prisma.contact.create({
      data: {
        fullName: from,
        phone: from,
        status: ContactStatus.Prospect,
        notes: "Auto-created from inbound SMS",
        ownerUserId: user.id,
      },
    });
  }

  await prisma.smsMessage.create({
    data: {
      phone: from,
      message: inbound,
      role: SmsRole.Inbound,
      contactId: contact.id,
      ownerUserId: user.id,
    },
  });

  const recentMessages = await prisma.smsMessage.findMany({
    where: {
      ownerUserId: user.id,
      contactId: contact.id,
    },
    orderBy: { sentAt: "desc" },
    take: 6,
  });

  const replyText = await handleSmsReceptionist({
    user,
    contact,
    inbound,
    recentMessages,
  });

  await prisma.smsMessage.create({
    data: {
      phone: from,
      message: replyText,
      role: SmsRole.Outbound,
      contactId: contact.id,
      ownerUserId: user.id,
    },
  });

  return new Response(smsResponse(replyText), {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}
