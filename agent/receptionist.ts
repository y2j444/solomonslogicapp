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

    const getCallerNumber = () => {
      const roomName = ctx.job.room?.name || "";
      const allNumbers = roomName.match(/\d{10,}/g) || [];
      const callerNumber = allNumbers.find(n => !n.startsWith("1615")) || allNumbers[1] || allNumbers[0] || "Unknown";
      return callerNumber.startsWith("+") ? callerNumber : "+" + (callerNumber.startsWith("1") ? "" : "1") + callerNumber;
    };

    const agent = new voice.Agent({
      instructions: `You are a friendly, professional human receptionist for ${businessName}.
        
Personality & Tone:
- You are sitting in a busy call center/office environment. Act like it!
- Be warm, helpful, and slightly casual, like a real person working in a busy office.
- Use natural human disfluencies sparingly (e.g., "umm," "hmm," "oh, let me see...") to make it sound like you are actively working.
- Use phrases like "Thanks for calling, just one second while I pull that up!" or "Oh, I'd be happy to help with that!"
- Your tone should be "phone-professional"—clear but energetic.

Today's Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Current Time: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}

Business Knowledge:
${knowledgeBase}

Call Handling Rules:
${callHandlingRules}

- If you use a tool (like checking availability), report the result to the user immediately. 
- Don't just say "one second" repeatedly; after the tool runs, give the answer and ask for the next step (e.g., "That time is free! Should I book it for you?").
- Keep your responses concise but natural.`,
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

              const conflict = await prisma.appointment.findFirst({
                where: {
                  ownerUserId: userRecord?.id || "",
                  startTime: {
                    lt: requestedEnd,
                  },
                },
              });

              if (conflict) {
                const conflictEnd = new Date(conflict.startTime.getTime() + conflict.durationMinutes * 60000);
                if (conflictEnd > requestedStart) {
                  return "That time is already booked. Please ask the user for another time.";
                }
              }

              return "That time is available! You can proceed to book the appointment.";
            } catch (error) {
              console.error("Availability check failed:", error);
              return "I'm sorry, I ran into an error checking the calendar. Let's try another time.";
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
            try {
              console.log("Booking appointment for:", customerName, "at", startTime);
              const appointmentDate = new Date(startTime);
              const normalizedPhone = getCallerNumber();

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

              await prisma.callLog.update({
                where: { callSid: ctx.job.id },
                data: { 
                  appointmentCreatedId: appointment.id,
                  appointmentStatus: "AppointmentCreated"
                }
              }).catch(() => {});

              return `Success! The appointment is booked for ${customerName} at ${startTime}.`;
            } catch (error) {
              console.error("Booking failed:", error);
              return "I'm sorry, I hit a snag while saving your appointment. Could you try one more time?";
            }
          },
        }),
      },
    });

    const transcript: { role: string; content: string }[] = [];

    const session = new voice.AgentSession({
      stt: new deepgram.STT(),
      tts: new cartesia.TTS(
        process.env.CARTESIA_VOICE_ID ? { voice: process.env.CARTESIA_VOICE_ID } : {}
      ),
      llm: new openai.LLM({
        model: "gpt-4o-mini",
      }),
    });

    // Create initial call log
    if (userRecord) {
      await prisma.callLog.create({
        data: {
          callSid: ctx.job.id,
          callerPhone: getCallerNumber(),
          direction: "Inbound",
          ownerUserId: userRecord.id,
          appointmentStatus: "PendingReview",
        }
      }).catch(e => console.error("Failed to create call log:", e));
    }

    session.on("user_transcript", (t) => {
      if (t.is_final) transcript.push({ role: "user", content: t.text });
    });
    session.on("agent_transcript", (t) => {
      if (t.is_final) transcript.push({ role: "assistant", content: t.text });
    });

    await session.start({ agent, room: ctx.room });
    console.log("Agent started!");
    
    const aiName = process.env.AI_NAME || "Solomon";
    session.say(`Hi, thanks for calling ${businessName}. This is ${aiName}!`);

    const startTimeMillis = Date.now();

    ctx.addShutdownCallback(async () => {
      console.log("Session shutting down, saving transcript...");
      if (userRecord) {
        try {
          const summary = transcript.length > 0 
            ? `Conversation with ${getCallerNumber()}. ${transcript.length} messages exchanged.`
            : "No dialog recorded.";

          await prisma.callLog.update({
            where: { callSid: ctx.job.id },
            data: {
              transcript: transcript as any,
              aiSummary: summary,
              durationSeconds: Math.floor((Date.now() - startTimeMillis) / 1000),
            }
          });
        } catch (e) {
          console.error("Failed to update final call log:", e);
        }
      }
    });
  },
});
