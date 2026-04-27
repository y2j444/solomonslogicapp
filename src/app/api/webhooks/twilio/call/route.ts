import { NextResponse } from "next/server";
import { CallAppointmentStatus, CallDirection } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    to?: string;
    from?: string;
    callSid?: string;
    direction?: "Inbound" | "Outbound";
    durationSeconds?: number;
  };
  if (!body.to || !body.from || !body.callSid) {
    return NextResponse.json({ error: "to, from, callSid are required" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({ where: { twilioPhone: body.to } });
  if (!user) {
    return NextResponse.json({ error: "Business not found for twilio number" }, { status: 404 });
  }

  const contact = await prisma.contact.findFirst({
    where: { ownerUserId: user.id, phone: body.from },
  });

  const call = await prisma.callLog.upsert({
    where: { callSid: body.callSid },
    create: {
      callerPhone: body.from,
      callSid: body.callSid,
      durationSeconds: body.durationSeconds ?? 0,
      direction:
        body.direction === "Outbound" ? CallDirection.Outbound : CallDirection.Inbound,
      aiSummary: "Summary placeholder. Connect OpenAI/Whisper to enrich this.",
      contactId: contact?.id,
      appointmentStatus: CallAppointmentStatus.PendingReview,
      ownerUserId: user.id,
    },
    update: {
      durationSeconds: body.durationSeconds ?? 0,
      direction:
        body.direction === "Outbound" ? CallDirection.Outbound : CallDirection.Inbound,
      contactId: contact?.id ?? undefined,
    },
  });
  return NextResponse.json({ success: true, call });
}
