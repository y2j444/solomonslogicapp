import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Vapi Config Webhook: Received body:", JSON.stringify(body, null, 2));

    // Vapi Phone Number 'Assistant Request URL' sends the 'phoneNumber' and 'customer' objects directly
    const twilioPhoneNumber =
      body.phoneNumber?.number ||
      body.message?.phoneNumber?.number ||
      body.call?.phoneNumber?.number;

    if (!twilioPhoneNumber) {
      console.error("Vapi Config Webhook: No phone number found in payload.");
      return NextResponse.json({ error: "Missing phone number" }, { status: 400 });
    }

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
      console.error(`Vapi Config Webhook: Business not found for ${normalizedPhone}`);
      // Minimal fallback to Solomon's Logic if user not found
      return NextResponse.json({
        assistant: {
          name: "Solomon's Logic Default",
          firstMessage: "Hello, this is Solomon's Logic. How can I help you?",
          model: {
            provider: "openai",
            model: "gpt-4-turbo",
            messages: [{ role: "system", content: "You are an AI receptionist for Solomon's Logic." }]
          }
        }
      });
    }

    const businessName = user.businessName || "our team";
    const now = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
    console.log(`Vapi Config Webhook: Success! Configuring for ${businessName}`);

    // This is the FULL Assistant object structure Vapi expects for an Assistant Request URL
    const response = {
      assistant: {
        name: `${businessName} AI Receptionist`,
        firstMessage: `Thank you for calling ${businessName}! How can I help you today?`,
        model: {
          provider: "openai",
          model: "gpt-4-turbo",
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content: `Current date/time: ${now}
Business timezone: America/New_York.

You are a professional AI receptionist for ${businessName}. Your primary job is to book appointments.

Required Info:
1. Caller's full name
2. Caller's phone number
3. Appointment reason
4. Preferred date and time

Instructions:
- Confirm the caller's phone number by repeating it back.
- Once you have all details, call the BookAppointment tool.
- After the tool succeeds, tell the caller: "You're all set. Your appointment is booked for [Time]."
- Always speak as a representative of ${businessName}.`
            }
          ]
        },
        tools: [
          {
            type: "function",
            function: {
              name: "BookAppointment",
              description: "Saves a new appointment into the CRM.",
              parameters: {
                type: "object",
                properties: {
                  twilioPhone: { type: "string", description: `Must be exactly "${normalizedPhone}"` },
                  callerName: { type: "string" },
                  callerPhone: { type: "string" },
                  appointmentTitle: { type: "string" },
                  startTime: { type: "string", description: "ISO 8601 string" },
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
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Vapi Config Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
