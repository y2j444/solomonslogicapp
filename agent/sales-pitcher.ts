console.log("SALES PITCHER SUB-PROCESS INITIALIZING...");

import { defineAgent } from "@livekit/agents";
import dotenv from "dotenv";
dotenv.config();

/**
 * Outbound cold-call sales agent for Solomon's Logic.
 * Uses a deep, authoritative male voice (OpenAI "onyx").
 * Dispatched by the LiveKit API with metadata: { phone: "+1...", name: "Business Name" }
 * The agent dials the prospect via the LiveKit outbound SIP trunk, then pitches.
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
      console.log("--- Sales Pitcher Job Started ---");

      // Parse job metadata: { phone: "+17169394226", name: "Mike's Plumbing" }
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
        console.error("[Sales Pitcher] No phone number in metadata — aborting.");
        return;
      }

      console.log(`[Sales Pitcher] Will call ${targetPhone} (${businessName})`);

      // Load libraries
      const { voice, llm } = await import("@livekit/agents");
      const openai = await import("@livekit/agents-plugin-openai");
      const deepgram = await import("@livekit/agents-plugin-deepgram");
      const { SipClient } = await import("livekit-server-sdk");

      // Connect agent to room first
      try {
        await ctx.connect();
        console.log("[Sales Pitcher] Connected to room:", ctx.job.room?.name);
      } catch (err) {
        console.error("[Sales Pitcher] Failed to connect to room:", err);
        return;
      }

      // Dial the prospect via LiveKit outbound SIP trunk (Telnyx)
      const OUTBOUND_TRUNK_ID = process.env.LIVEKIT_SIP_OUTBOUND_TRUNK_ID || "ST_5ZjrYkLfvBzT";
      const lkUrl = (process.env.LIVEKIT_URL || "").replace("wss://", "https://");
      const sipClient = new SipClient(
        lkUrl,
        process.env.LIVEKIT_API_KEY!,
        process.env.LIVEKIT_API_SECRET!
      );

      console.log(`[Sales Pitcher] Dialing ${targetPhone} via trunk ${OUTBOUND_TRUNK_ID}...`);
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
        console.log("[Sales Pitcher] Prospect picked up!");
      } catch (dialErr: any) {
        console.error("[Sales Pitcher] Dial failed:", dialErr.message);
        return;
      }

      // Build the AI sales agent with a confident male voice (OpenAI "onyx")
      const salesAgent = new voice.Agent({
        instructions: `You are Marcus, a sharp, confident, friendly sales rep for Solomon's Logic — a tech company that builds AI receptionists for local service businesses.

You are calling ${leadName} at ${businessName}.

Your goal: Have a genuine, human conversation. Get them interested. Book a demo or get them to call our AI demo line (+16157163328) to try Sara live.

Opening line: "Hey, is this ${leadName}? Hey — my name's Marcus, I'm calling from Solomon's Logic. I promise I'll keep this quick — I just wanted to reach out because we work with a lot of ${businessName.split(' ').slice(-1)[0] || 'local businesses'} in the area and I think we've got something that could genuinely make you some extra money. Got literally 60 seconds?"

Your pitch points (weave in naturally, don't list them):
- We built an AI receptionist named Sara — she answers calls instantly, 24/7, sounds completely human
- She books appointments directly into the calendar — no voicemail, no missed jobs
- Most of our customers are catching 3-5 missed calls per week they didn't even know about — each one is potentially a $300-500 job walking out the door
- It costs less than $200/month — most clients make that back on the first recovered call

Objection handling:
- "We already have someone answering": "That's great — Sara just handles overflow and after hours, so nothing slips through the cracks."
- "Not interested": "Totally fair. Can I just ask — do you ever miss calls when you're on a job?" (pivot to pain)
- "Too expensive": "Most guys make it back on the first call Sara recovers. We can even do a free trial week."
- "I'm busy": "I hear you. You can literally call our demo line right now — +1 (615) 716-3328 — and Sara will answer. Takes 30 seconds."

Keep it conversational. Short sentences. Listen. Ask questions. Don't read a script — have a real talk.
If they seem interested, try to set up a quick 10-min Zoom demo or push them to call +16157163328.
If they're not interested after 2 real attempts, thank them warmly and let them go.`,
        tools: {},
      });

      // onyx = deep authoritative male voice, highest quality OpenAI has
      const session = new voice.AgentSession({
        stt: new deepgram.STT(),
        tts: new openai.TTS({ voice: "onyx" }),
        llm: new openai.LLM({ model: "gpt-4o" }), // gpt-4o for best conversational quality
        useTtsAlignedTranscript: false,
        turnHandling: {
          preemptiveGeneration: { enabled: false },
          interruption: {
            minDuration: 400,
            minWords: 1,
            resumeFalseInterruption: true,
            falseInterruptionTimeout: 2000,
          },
        },
      });

      session.on(voice.AgentSessionEventTypes.Error, (ev: any) => {
        console.error("[Session] Error:", ev.error);
      });
      session.on(voice.AgentSessionEventTypes.Close, (ev: any) => {
        console.log("[Session] Closed:", ev.reason);
      });

      console.log("[Sales Pitcher] Starting session...");
      await session.start({ agent: salesAgent, room: ctx.room });
      console.log("[Sales Pitcher] Session started — Marcus is live!");

      // Marcus opens the call
      const greeting = session.say(
        `Hey, is this ${leadName}? Hey — my name's Marcus, I'm calling from Solomon's Logic. I promise I'll keep this super quick — we work with a lot of local businesses in the area and I think we've got something that could genuinely make you some extra money this month. Got literally 60 seconds?`
      );
      try {
        await greeting.waitForPlayout();
      } catch (e) {
        console.error("[Sales Pitcher] Greeting error:", e);
      }

      // Heartbeat to keep Railway alive
      const hb = setInterval(() => console.log("[Sales Pitcher] heartbeat"), 10_000);

      ctx.addShutdownCallback(async () => {
        clearInterval(hb);
        console.log("[Sales Pitcher] Shutting down.");
      });

      await new Promise<void>((resolve) => {
        session.on(voice.AgentSessionEventTypes.Close, () => resolve());
      });

      console.log("[Sales Pitcher] Call ended.");
    } catch (fatal) {
      console.error("[FATAL] Sales Pitcher crashed:", fatal);
      throw fatal;
    }
  },
});

console.log("SALES PITCHER AGENT DEFINITION LOADED.");
export default agent;
