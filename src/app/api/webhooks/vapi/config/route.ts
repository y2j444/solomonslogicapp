import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Vapi Webhook received:", body.message?.type || "No message type");

    // Extract the Twilio number that was called
    const twilioPhoneNumber =
      body.message?.phoneNumber?.number ||
      body.message?.call?.phoneNumber?.number ||
      body.phoneNumber?.number ||
      body.call?.phoneNumber?.number;

    if (!twilioPhoneNumber) {
      console.error("Vapi Webhook: No phone number found in request body.");
      return NextResponse.json({ error: "No phone number" }, { status: 400 });
    }

    const normalizedPhone = twilioPhoneNumber.startsWith('+') ? twilioPhoneNumber : `+${twilioPhoneNumber}`;

    // Find the User/Business associated with this Twilio number
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { twilioPhone: normalizedPhone },
          { twilioPhone: twilioPhoneNumber }
        ]
      },
    });

    if (!user) {
      console.error(`Vapi Webhook: No business found for ${normalizedPhone}`);
      // Return a default assistant so the call doesn't fail completely
      return NextResponse.json({
        assistant: {
          firstMessage: "Hello, this is Solomon's Logic. How can I help you?",
          model: {
            messages: [{ role: "system", content: "You are an AI receptionist for Solomon's Logic." }]
          }
        }
      });
    }

    const businessName = user.businessName || "our team";
    const now = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });

    console.log(`Vapi Webhook: Configuring assistant for ${businessName}`);

    // This is the structure for a full Assistant Override
    const assistantConfig = {
      firstMessage: `Thank you for calling ${businessName}! How can I help you today?`,
      model: {
        provider: "openai",
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Current date/time: ${now}
Business timezone: America/New_York.

You are a professional AI receptionist for ${businessName}. Your job is to book appointments.

Collect these details:
1. Caller full name
2. Caller phone number
3. Appointment reason
4. Appointment date and time

Rules:
- Repeat the phone number back to confirm.
- Only call BookAppointment once all details are confirmed.
- Use twilioPhone: "${normalizedPhone}" for the tool call.`,
          },
        ],
      },
      tools: [
        {
          type: "function",
          function: {
            name: "BookAppointment",
            description: "Books an appointment in the CRM.",
            parameters: {
              type: "object",
              properties: {
                twilioPhone: { type: "string", description: "The business phone number." },
                callerName: { type: "string" },
                callerPhone: { type: "string" },
                appointmentTitle: { type: "string" },
                startTime: { type: "string", description: "ISO 8601 format" },
                durationMinutes: { type: "number", default: 30 },
                notes: { type: "string" }
              },
              required: ["twilioPhone", "callerName", "callerPhone", "appointmentTitle", "startTime"]
            }
          },
          server: {
             url: "https://app.solomonslogic.com/api/appointments"
          }
        }
      ]
    };

    // If this is an 'assistant-request' (Phone number level webhook)
    if (body.message?.type === "assistant-request") {
      return NextResponse.json({ assistant: assistantConfig });
    }

    // If this is a 'tool-call' (Assistant level webhook)
    // We return the assistant override directly
    return NextResponse.json({ assistant: assistantConfig });

  } catch (error) {
    console.error("Vapi Webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
