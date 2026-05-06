import { 
  defineAgent, 
  voice, 
  llm,
  type JobContext,
  type JobRequest
} from "@livekit/agents";
import { z } from "zod";
import * as openai from "@livekit/agents-plugin-openai";
import * as deepgram from "@livekit/agents-plugin-deepgram";
import * as cartesia from "@livekit/agents-plugin-cartesia";
import { prisma } from "../src/lib/prisma";

export default defineAgent({
  entry: async (ctx: JobContext) => {
    console.log("--- Job Started ---");
    console.log("Connecting to room:", ctx.job.room?.name);
    
    try {
      await ctx.connect();
      console.log("Connected to room!");
    } catch (error) {
      console.error("Failed to connect to room:", error);
      return;
    }

    let businessName = "Solomon's Logic";
    let knowledgeBase = "No specific knowledge base provided.";
    let callHandlingRules = "Help the user by answering their questions.";

    let userRecord = null;
    try {
      const roomPrefix = ctx.room.name.split(/[-_]/)[0];
      let rawNumber = ctx.room.metadata || roomPrefix || process.env.TELNYX_PHONE_NUMBER || "";
      if (typeof rawNumber === "object") {
        rawNumber = JSON.stringify(rawNumber);
      }
      
      const calledNumber = rawNumber.trim();
      const withPlus = calledNumber.startsWith("+") ? calledNumber : "+" + calledNumber;
      const withoutPlus = calledNumber.replace("+", "");

      console.log("Looking up business for number:", calledNumber);
      
      userRecord = await prisma.user.findFirst({
        where: {
          OR: [
            { AIPhone: calledNumber },
            { AIPhone: withPlus },
            { AIPhone: withoutPlus },
          ],
        },
      });

      if (userRecord?.businessName) {
        businessName = userRecord.businessName;
        console.log("Found business name:", businessName);
      }
      if (userRecord?.knowledgeBase) {
        knowledgeBase = userRecord.knowledgeBase;
      }
      if (userRecord?.callHandlingRules) {
        callHandlingRules = userRecord.callHandlingRules;
      }
    } catch (e) {
      console.error("DB error during lookup:", e);
    }

    const session = new voice.AgentSession({
      stt: new deepgram.STT(),
      tts: new cartesia.TTS(),
      llm: new openai.LLM({
        model: "gpt-4o-mini",
      }),
    });

    const agent = new voice.Agent({
      instructions: `You are the AI receptionist for ${businessName}.
        
Today's Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Current Time: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}

Business Knowledge:
${knowledgeBase}

Call Handling Rules:
${callHandlingRules}

Your goal is to be helpful and professional. Keep your responses concise.`,
      tools: {
        check_availability: llm.tool({
          description: "Check if a specific date and time is available for an appointment.",
          parameters: z.object({
            startTime: z.string().describe("The ISO 8601 date and time to check (e.g., 2025-05-01T10:00:00)."),
          }),
          execute: async ({ startTime }) => {
            try {
              console.log("Checking availability for:", startTime);
              const requestedStart = new Date(startTime);
              const requestedEnd = new Date(requestedStart.getTime() + 30 * 60000);

              // Find any appointment that overlaps with the requested window
              // Overlap formula: (StartA < EndB) AND (EndA > StartB)
              const conflict = await prisma.appointment.findFirst({
                where: {
                  ownerUserId: userRecord?.id || "",
                  startTime: {
                    lt: requestedEnd,
                  },
                },
              });

              if (conflict) {
                // Check if the end of the existing appointment overlaps with our start
                const conflictEnd = new Date(conflict.startTime.getTime() + conflict.durationMinutes * 60000);
                if (conflictEnd > requestedStart) {
                  return "That time is already booked. Please ask the user for another time.";
                }
              }

              return "That time is available! You can proceed to book the appointment.";
            } catch (error) {
              console.error("Availability check failed:", error);
              return "I'm sorry, I ran into an error checking the calendar. Please try another time.";
            }
          },
        }),
        book_appointment: llm.tool({
          description: "Book an appointment for the customer.",
          parameters: z.object({
            startTime: z.string().describe("The ISO 8601 date and time for the appointment."),
            customerName: z.string().describe("The full name of the customer."),
            notes: z.string().optional().describe("Any additional notes for the appointment."),
          }),
          execute: async ({ startTime, customerName, notes }) => {
            console.log("Booking appointment for:", customerName, "at", startTime);
            
            const appointmentDate = new Date(startTime);
            
            // 1. Find or create contact
            const roomName = ctx.job.room?.name || "";
            const parts = roomName.split(/[-_]/);
            const callerNumber = parts[1] || ""; // Format is typically "businessNumber-callerNumber-..."
            const normalizedPhone = callerNumber.startsWith("+") ? callerNumber : "+" + callerNumber;

            console.log("Extracted caller phone:", normalizedPhone, "from room:", roomName);

            let contact = await prisma.contact.findFirst({
              where: { ownerUserId: userRecord?.id || "", phone: normalizedPhone },
            });

            if (!contact) {
              contact = await prisma.contact.create({
                data: {
                  fullName: customerName,
                  phone: normalizedPhone,
                  ownerUserId: userRecord?.id || "",
                },
              });
            }

            // 2. Create appointment
            const appointment = await prisma.appointment.create({
              data: {
                title: `Appt: ${customerName}`,
                startTime: appointmentDate,
                durationMinutes: 30,
                contactId: contact.id,
                ownerUserId: userRecord?.id || "",
                notes: notes || "Booked by Solomon AI",
              },
            });

            return `Success! The appointment is booked for ${customerName} at ${startTime}.`;
          },
        }),
      },
    });

    await session.start({ agent, room: ctx.room });
    console.log("Agent started!");
    session.say(`Hi, thanks for calling ${businessName}. This is Solomon!`);
  },
});
