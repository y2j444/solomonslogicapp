console.log("RECEPTIONIST SUB-PROCESS INITIALIZING...");

import { defineAgent } from "@livekit/agents";

export default defineAgent({
  entry: async (ctx: any) => {
    console.log("--- Job Started ---");
    console.log("[Debug] Loading Libraries...");
    
    // Load EVERYTHING only when the job starts
    const { voice, llm } = await import("@livekit/agents");
    const { z } = await import("zod");
    const openai = await import("@livekit/agents-plugin-openai");
    const deepgram = await import("@livekit/agents-plugin-deepgram");
    const cartesia = await import("@livekit/agents-plugin-cartesia");
    const { prisma } = await import("../src/lib/prisma");
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
      const roomPrefix = ctx.job.room?.name.split(/[-_]/)[0] || "";
      let rawNumber = ctx.job.room?.metadata || roomPrefix || process.env.TELNYX_PHONE_NUMBER || "";
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
- Be warm, helpful, and professional, like a real person working in a quiet, organized office.
- Use natural human disfluencies very sparingly (e.g., "hmm," "oh, let me see...") to sound authentic.
- Be clear, energetic, and focused on helping the caller.
- If a caller wants to change or reschedule an existing appointment:
  1. Call 'get_customer_appointments' to find their current booking.
  2. Use 'update_appointment' to apply the change.
- Never create a new appointment if they are just trying to move an existing one.

Today's Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Current Time: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}

Business Knowledge:
${knowledgeBase}

Call Handling Rules:
${callHandlingRules}

- NEVER say "one second" or "let me check" while running a tool. Just run the tool in silence.
- Once the tool finishes, report the result IMMEDIATELY and ask for the next step.
- Example: "That time is available! Should I go ahead and book that for you?"
- Be direct, professional, and fast.`,
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
        get_customer_appointments: llm.tool({
          description: "Get all existing appointments for the current customer.",
          parameters: z.object({}),
          execute: async () => {
            try {
              const normalizedPhone = getCallerNumber();
              const appointments = await prisma.appointment.findMany({
                where: {
                  contact: { phone: normalizedPhone },
                  ownerUserId: userRecord?.id || "",
                },
                orderBy: { startTime: "asc" },
                take: 5,
              });

              if (appointments.length === 0) return "You don't have any appointments scheduled currently.";

              return appointments.map((a: any) => 
                `ID: ${a.id}, Time: ${a.startTime.toLocaleString()}, Note: ${a.notes || 'None'}`
              ).join("\n");
            } catch (error) {
              console.error("Lookup failed:", error);
              return "I'm sorry, I couldn't retrieve your appointments right now.";
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

              // Duplicate protection: check if an appointment already exists for this contact at this time
              const existingAppt = await prisma.appointment.findFirst({
                where: {
                  contactId: contact.id,
                  startTime: appointmentDate,
                }
              });

              if (existingAppt) {
                console.log("Existing appointment found, skipping duplicate creation.");
                return `The appointment for ${customerName} at ${startTime} is already on the calendar! I've confirmed it's all set.`;
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
        update_appointment: llm.tool({
          description: "Update an existing appointment for the customer (e.g., reschedule).",
          parameters: z.object({
            existingAppointmentId: z.string().describe("The ID of the appointment to update."),
            newStartTime: z.string().optional().describe("The new ISO 8601 date and time."),
            notes: z.string().optional().describe("Updated notes."),
          }),
          execute: async ({ existingAppointmentId, newStartTime, notes }) => {
            try {
              console.log("Updating appointment:", existingAppointmentId);
              const updateData: any = {};
              if (newStartTime) updateData.startTime = new Date(newStartTime);
              if (notes) updateData.notes = notes;

              const appointment = await prisma.appointment.update({
                where: { id: existingAppointmentId },
                data: updateData,
              });

              return `Success! I've updated the appointment. It is now scheduled for ${appointment.startTime.toLocaleString()}.`;
            } catch (error) {
              console.error("Update failed:", error);
              return "I couldn't find that appointment to update. Could you give me the details again?";
            }
          },
        }),
      },
    });

    const transcript: { role: string; content: string }[] = [];

    console.log("Using Cartesia Voice ID:", process.env.CARTESIA_VOICE_ID || "Default (None)");
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
      }).catch((e: any) => console.error("Failed to create call log:", e));
    }

    const startTimeMillis = Date.now();
    const saveTranscript = async () => {
      if (userRecord) {
        try {
          console.log(`[Logging] Saving ${transcript.length} turns to DB...`);
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
          // Silent fail for background logging
        }
      }
    };

    session.on(voice.AgentSessionEventTypes.UserInputTranscribed, (t: voice.UserInputTranscribedEvent) => {
      const text = t.transcript?.trim();
      if (text) {
        const lastTurn = transcript[transcript.length - 1];
        if (lastTurn && lastTurn.role === "user" && !t.isFinal) {
          lastTurn.content = text;
        } else if (t.isFinal || !lastTurn || lastTurn.role !== "user") {
          transcript.push({ role: "user", content: text });
        }
        saveTranscript();
      }
    });
    session.on(voice.AgentSessionEventTypes.ConversationItemAdded, (ev: voice.ConversationItemAddedEvent) => {
      if ('role' in ev.item && ev.item.role === "assistant" && ev.item.content) {
        const textContent = Array.isArray(ev.item.content) 
          ? ev.item.content.map(c => (typeof c === 'object' && c !== null && 'text' in c) ? c.text : (typeof c === 'string' ? c : '')).join('')
          : ev.item.content;
        transcript.push({ role: "assistant", content: textContent as string });
        saveTranscript();
      }
    });

    await session.start({ agent, room: ctx.room });
    console.log("Agent started!");
    
    session.say(`Hi, thanks for calling ${businessName}. This is Sara, how can I help you?`);


    ctx.addShutdownCallback(async () => {
      console.log("Session shutting down, saving final state...");
      await saveTranscript();
    });
  },
});
