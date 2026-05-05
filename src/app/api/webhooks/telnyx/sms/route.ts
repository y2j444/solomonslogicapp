import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SmsRole } from "@prisma/client";

/**
 * Handles inbound SMS from Telnyx
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = body.data;

    // Ensure this is an SMS message
    if (event.event_type !== "message.received") {
      return NextResponse.json({ status: "ignored" });
    }

    const payload = event.payload;
    const from = payload.from.phone_number; // The sender (customer)
    const to = payload.to[0].phone_number; // Your Telnyx number
    const text = payload.text;

    // 1. Identify the owner by the Telnyx number
    const owner = await prisma.user.findFirst({
      where: {
        OR: [
          { AIPhone: to }, // We still use this field in DB for now
          { AIPhone: to.replace("+1", "") },
        ],
      },
    });

    if (!owner) {
      console.error(`[telnyx-sms] No owner found for number: ${to}`);
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    // 2. Find or create the contact
    let contact = await prisma.contact.findFirst({
      where: { ownerUserId: owner.id, phone: from },
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          fullName: from,
          phone: from,
          ownerUserId: owner.id,
          notes: "Created from Telnyx SMS",
        },
      });
    }

    // 3. Save the message
    await prisma.smsMessage.create({
      data: {
        phone: from,
        message: text,
        role: SmsRole.Inbound,
        contactId: contact.id,
        ownerUserId: owner.id,
      },
    });

    console.log(`[telnyx-sms] Saved message from ${from}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[telnyx-sms] Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
