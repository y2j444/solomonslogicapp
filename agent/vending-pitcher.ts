console.log("VENDING PITCHER SUB-PROCESS INITIALIZING...");

import { defineAgent } from "@livekit/agents";
import dotenv from "dotenv";
dotenv.config();

/**
 * Outbound cold-call sales agent for AI Vending Machines.
 * Uses a deep, authoritative male voice (OpenAI "onyx").
 */
const agent = defineAgent({
  entry: async (ctx: any) => {
    process.on("uncaughtException", (err) => {
      console.error("[FATAL] Uncaught Exception:", err);
    });
    process.on("unhandledRejection", (reason) => {
      const name = reason instanceof Error ? reason.name : "";
      const msg = reason instanceof Error ? reason.message : String(reason);
      if (name === "APIUserAbortError" || msg.includes("abort")) return;
      console.error("[FATAL] Unhandled Rejection:", reason);
    });

    try {
      console.log("--- Vending Pitcher Job Started ---");

      let metadata: { phone?: string; name?: string; leadName?: string } = {};
      try {
        metadata = JSON.parse(ctx.job.metadata || "{}");
      } catch {
        console.warn("Could not parse job metadata:", ctx.job.metadata);
      }

      const targetPhone = metadata.phone || "";
      const businessName = metadata.name || "your business";
      const leadName = metadata.leadName || "there";

      if (!targetPhone) {
        console.error("[Vending Pitcher] No phone number in metadata — aborting.");
        return;
      }

      console.log(`[Vending Pitcher] Will call ${targetPhone} (${businessName})`);

      const { voice, llm } = await import("@livekit/agents");
      const openai = await import("@livekit/agents-plugin-openai");
      const deepgram = await import("@livekit/agents-plugin-deepgram");
      const { SipClient } = await import("livekit-server-sdk");

      try {
        await ctx.connect();
        console.log("[Vending Pitcher] Connected to room:", ctx.job.room?.name);
      } catch (err) {
        console.error("[Vending Pitcher] Failed to connect to room:", err);
        return;
      }

      const OUTBOUND_TRUNK_ID = process.env.LIVEKIT_SIP_OUTBOUND_TRUNK_ID || "ST_bVKKDE2q3S48";
      const lkUrl = (process.env.LIVEKIT_URL || "").replace("wss://", "https://");
      const sipClient = new SipClient(
        lkUrl,
        process.env.LIVEKIT_API_KEY!,
        process.env.LIVEKIT_API_SECRET!
      );

      console.log(`[Vending Pitcher] Dialing ${targetPhone} via trunk ${OUTBOUND_TRUNK_ID}...`);
      try {
        await sipClient.createSipParticipant(
          OUTBOUND_TRUNK_ID,
          targetPhone,
          ctx.job.room?.name,
          {
            participantIdentity: `prospect-${targetPhone}`,
            participantName: businessName,
            waitUntilAnswered: true,
          }
        );
        console.log("[Vending Pitcher] Prospect picked up!");
      } catch (dialErr: any) {
        console.error("[Vending Pitcher] Dial failed:", dialErr.message);
        return;
      }

      const salesAgent = new voice.Agent({
        instructions: `You are Sara, a sharp, confident, friendly sales rep calling on behalf of Mike Janico. 

Your goal: Have a genuine, human conversation. Get them interested in placing a new-style AI Vending Machine at their location. 
If they are interested, tell them to call Mike Janico, the CEO of Solomon's Logic AI Vending Machines, directly at 716-939-4226.

Opening line: "Hey, is this ${leadName}? Hey — my name's Sara, I'm calling from Solomon's Logic AI Vending Machines. I promise I'll keep this quick — we're placing some brand new, fully automated smart vending machines around the area and I thought your location at ${businessName} would be perfect. Got literally 60 seconds?"

Your pitch points (weave in naturally, don't list them):
- These aren't the old clunky machines. These are unattended, smart vending machines. 
- You can use Apple Pay, Google Pay, or a credit card to unlock the door, grab whatever you want, and just walk away. It automatically charges you. Exactly like going to a modern convenience store.
- It's a huge amenity for your staff and customers, zero cost to you to place it, and we handle all the stocking and maintenance.

Objection handling:
- "We already have a machine": "That's great — but is it an old coin-op one? Ours lets people grab multiple items at once using Apple Pay. People love them."
- "Not interested": "Totally fair. Just curious, what do you guys currently do for snacks or drinks for the staff?"
- "How much does it cost?": "Zero. We place it for free, stock it for free, and maintain it. It's just a free amenity for your building."
- "I'm busy": "I hear you. If you want to check it out later, just give Mike Janico a call at 716-939-4226 — he's the CEO and can walk you through everything personally."

Keep it conversational. Short sentences. Listen. Ask questions. Don't read a script — have a real talk.
Call to Action: If they seem interested, tell them: "Awesome. The best next step is to just give Mike Janico a call or text at 716-939-4226 — he's the CEO of Solomon's Logic AI Vending Machines and he's personally overseeing the placements this week."
If they're not interested after 2 real attempts, thank them warmly and let them go.`,
        tools: {},
      });

      const session = new voice.AgentSession({
        stt: new deepgram.STT(),
        tts: new openai.TTS({ voice: "nova", model: "tts-1" }), // nova = warm realistic female
        llm: new openai.LLM({ model: "gpt-4o-mini" }),
        useTtsAlignedTranscript: false,
        turnHandling: {
          preemptiveGeneration: { enabled: true },
          interruption: {
            minDuration: 800,
            minWords: 3,
            resumeFalseInterruption: true,
            falseInterruptionTimeout: 1000,
          },
        },
      });

      session.on(voice.AgentSessionEventTypes.Error, (ev: any) => {
        console.error("[Session] Error:", ev.error);
      });
      session.on(voice.AgentSessionEventTypes.Close, (ev: any) => {
        console.log("[Session] Closed:", ev.reason);
      });

      console.log("[Vending Pitcher] Starting session...");
      await session.start({ agent: salesAgent, room: ctx.room });
      console.log("[Vending Pitcher] Session started — Marcus is live!");

      const greeting = session.say(
        `Hey, is this ${leadName}? Hey — my name's Sara, I'm calling from Solomon's Logic AI Vending Machines. I promise I'll keep this quick — we're placing some brand new smart vending machines in the area and I thought ${businessName} would be a great fit. Got literally 60 seconds?`
      );
      try {
        await greeting.waitForPlayout();
      } catch (e) {
        console.error("[Vending Pitcher] Greeting error:", e);
      }

      const hb = setInterval(() => console.log("[Vending Pitcher] heartbeat"), 10_000);

      ctx.addShutdownCallback(async () => {
        clearInterval(hb);
        console.log("[Vending Pitcher] Shutting down.");
      });

      await new Promise<void>((resolve) => {
        session.on(voice.AgentSessionEventTypes.Close, () => resolve());
      });

      console.log("[Vending Pitcher] Call ended.");
    } catch (fatal) {
      console.error("[FATAL] Vending Pitcher crashed:", fatal);
      throw fatal;
    }
  },
});

console.log("VENDING PITCHER AGENT DEFINITION LOADED.");
export default agent;
