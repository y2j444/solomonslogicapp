import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messageType = body.message?.type;
    console.log(`Vapi config webhook: Received message type: ${messageType}`);

    // If it's not a request for configuration, just acknowledge
    if (messageType !== "assistant-request" && messageType !== "assistant.started") {
      return NextResponse.json({ status: "ok" });
    }

    const twilioPhoneNumber =
      body.message?.phoneNumber?.number ||
      body.message?.call?.phoneNumber?.number ||
      body.phoneNumber?.number;

    if (!twilioPhoneNumber) {
      console.log("Vapi config webhook: No twilioPhoneNumber found.");
      return NextResponse.json({});
    }

    const normalizedPhone = twilioPhoneNumber.startsWith('+') ? twilioPhoneNumber : `+${twilioPhoneNumber}`;

    // Find the business owner by the Twilio number called
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { twilioPhone: normalizedPhone },
          { twilioPhone: twilioPhoneNumber }
        ]
      },
    });

    if (!user) {
      console.log(`Vapi config webhook: No user found for ${normalizedPhone}`);
      return NextResponse.json({});
    }

    const businessName = user.businessName?.trim() || "our team";
    console.log(`Vapi config webhook: Overriding config for ${businessName}`);

    // This response overrides the Assistant configuration dynamically
    return NextResponse.json({
      assistant: {
        firstMessage: `Thank you for calling ${businessName}! How can I help you today?`,
        model: {
          messages: [
            {
              role: "system",
              content: `Current date/time: {{now}}
Business timezone: America/New_York.

You are a professional AI receptionist for ${businessName}.

Your primary goal is to assist callers by booking appointments into the system.

### Required Information to Collect:
1. **Full Name**: The caller's first and last name.
2. **Phone Number**: The best contact number for the caller.
3. **Reason**: A brief description of why they are booking.
4. **Date and Time**: When they would like the appointment to occur.

### Critical Rules:
- **Tool Usage**: Do not invoke 'BookAppointment' until you have collected and confirmed all four required details.
- **No Lookups**: Do not attempt to use any contact lookup or search tools.
- **Phone Numbers**: If a caller provides a number, repeat it back to ensure accuracy before proceeding.
- **Post-Booking**: Once 'BookAppointment' returns a success, inform the caller: "You're all set. Your appointment is booked for [Time]." Do not ask for their details again.

### Tool Parameters for 'BookAppointment':
- **twilioPhone**: Must be exactly "${normalizedPhone}".
- **callerName**: The caller's full name.
- **callerPhone**: The confirmed contact number.
- **appointmentTitle**: The reason for the appointment.
- **startTime**: The confirmed time in ISO 8601 format.
- **durationMinutes**: Default to 30.
- **notes**: A concise summary of the call.`,
            },
          ],
        },
      },
    });
  } catch (error) {
    console.error("Vapi config webhook failed:", error);
    return NextResponse.json({}, { status: 500 });
  }
}