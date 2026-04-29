import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Vapi config webhook: Received message type:", body.message?.type);

    // Vapi sends an 'assistant-request' message to get dynamic configuration
    if (body.message?.type !== "assistant-request") {
      // For other message types (like tool-calls or status-updates), we just return 200
      // The BookAppointment tool call is handled by its own serverUrl if configured,
      // but if Vapi is configured to use the same Server URL for everything,
      // we need to be careful not to override tool responses here.
      return NextResponse.json({ status: "ok" });
    }

    const twilioPhoneNumber = body.message?.phoneNumber?.number || body.message?.call?.phoneNumber?.number;

    console.log("Vapi config webhook: Extracted twilioPhoneNumber:", twilioPhoneNumber);

    if (!twilioPhoneNumber) {
      console.error("Vapi config webhook: Missing twilioPhoneNumber in request.");
      return NextResponse.json({}); // Return empty to let Vapi use defaults
    }

    // Normalize phone number for database lookup (E.164)
    const normalizedPhone = twilioPhoneNumber.startsWith('+') ? twilioPhoneNumber : `+${twilioPhoneNumber}`;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { twilioPhone: normalizedPhone },
          { twilioPhone: twilioPhoneNumber }
        ]
      },
    });

    if (!user) {
      console.error(`Vapi config webhook: No user found for phone: ${normalizedPhone}`);
      return NextResponse.json({}); // Fallback to Vapi defaults
    }

    const businessName = user.businessName || "our team";
    console.log(`Vapi config webhook: Found business: ${businessName}. Sending overrides.`);

    // This is the specific response structure Vapi expects for 'assistant-request' overrides
    const responseOverrides = {
      assistant: {
        firstMessage: `Thank you for calling ${businessName}! How can I help you today?`,
        model: {
          messages: [
            {
              role: "system",
              content: `Current date/time: {{now}}\nBusiness timezone: America/New_York.\n\nYou are an AI receptionist for ${businessName}.\n\nYour job is to book appointments.\n\nCollect these required details:\n1. Caller full name\n2. Caller phone number\n3. Appointment reason\n4. Appointment date and time\n\nImportant rules:\n- Do not call BookAppointment until all required details are collected.\n- Do not call lookup-contact.\n- Do not call any contact lookup tool.\n- Only use the BookAppointment tool for booking.\n- If the caller gives a phone number verbally, convert it into digits.\n- Repeat the phone number back once for confirmation.\n- Once the caller confirms the phone number and appointment time, do not ask for them again.\n- After BookAppointment succeeds, tell the caller the appointment is booked.\n\nWhen calling BookAppointment:\n- Set twilioPhone to "${normalizedPhone}" exactly. \n- Set callerName to the caller's full name.\n- Set callerPhone to the confirmed phone number.\n- Set appointmentTitle to the appointment reason.\n- Set startTime to the confirmed appointment time in ISO 8601 format.\n- Set durationMinutes to 30 unless the caller requests a different duration.\n- Put a short call summary in notes.\n\nIf BookAppointment succeeds, say:\n"You're all set. Your appointment is booked."\n\nNever ask for the phone number or booking time again after the tool succeeds.`,
            },
          ],
        },
      },
    };

    return NextResponse.json(responseOverrides);
  } catch (error) {
    console.error("Vapi config webhook failed:", error);
    return NextResponse.json({}, { status: 500 });
  }
}
