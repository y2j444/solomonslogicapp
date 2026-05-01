import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CallDirection } from "@prisma/client";

/**
 * Handles the "end-of-call-report" from Vapi.
 * This captures the full transcript and AI summary.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    // Check if this is the end-of-call-report
    if (message?.type !== "end-of-call-report") {
      return NextResponse.json({ status: "ignored" });
    }

    const call = message.call;
    const transcript = message.transcript || "";
    const summary = message.summary || "";
    const durationSeconds = Math.round(message.durationSeconds || 0);
    const callerPhone = call?.customer?.number || "";
    const businessPhone = message.phoneNumber?.number || "";
    const callSid = call?.id || `vapi_${Date.now()}`;

    // 1. Identify the user (owner) by the business phone number
    const owner = await prisma.user.findFirst({
      where: {
        OR: [
          { twilioPhone: businessPhone },
          { twilioPhone: businessPhone.replace("+1", "") },
        ],
      },
    });

    if (!owner) {
      console.error(`[vapi-report] Could not find owner for phone: ${businessPhone}`);
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    // 2. Find or Create the CallLog
    // Note: The 'book' tool might have already created a log for this call.
    // We update it with the full transcript and summary.
    const callLog = await prisma.callLog.upsert({
      where: { callSid: callSid },
      update: {
        durationSeconds,
        aiSummary: summary,
        transcript: message.messages || [], // Vapi sends the structured messages here
      },
      create: {
        callSid,
        callerPhone,
        durationSeconds,
        direction: CallDirection.Inbound,
        aiSummary: summary,
        transcript: message.messages || [],
        ownerUserId: owner.id,
      },
    });

    console.log(`[vapi-report] Saved transcript for call: ${callSid}`);
    return NextResponse.json({ success: true, id: callLog.id });
  } catch (error) {
    console.error("[vapi-report] Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
