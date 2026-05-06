import {
  defineAgent,
  voice,
  type JobContext,
  type JobRequest
} from "@livekit/agents";
import * as openai from "@livekit/agents-plugin-openai";
import * as deepgram from "@livekit/agents-plugin-deepgram";
import * as cartesia from "@livekit/agents-plugin-cartesia";
import { prisma } from "../src/lib/prisma";

export default defineAgent({
  request_handler: async (req: JobRequest) => {
    console.log("--- Received Job Request ---");
    console.log("Job ID:", req.job.id);
    console.log("Job Type:", req.job.type);
    await req.accept();
  },
  entrypoint: async (ctx: JobContext) => {
    console.log("--- Job Started ---");
    console.log("Connecting to room:", ctx.room.name);

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

    try {
      // Handle the Room Prefix (e.g. "16157163328-xxxx")
      const roomPrefix = ctx.room.name.split(/[-_]/)[0];
      
      let rawNumber = ctx.room.metadata || roomPrefix || process.env.TELNYX_PHONE_NUMBER || "";
      if (typeof rawNumber === "object") {
        rawNumber = JSON.stringify(rawNumber);
      }
      
      const calledNumber = rawNumber.trim();
      const withPlus = calledNumber.startsWith("+") ? calledNumber : "+" + calledNumber;
      const withoutPlus = calledNumber.replace("+", "");

      console.log("Looking up business for number:", calledNumber, "or", withPlus);
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { AIPhone: calledNumber },
            { AIPhone: withPlus },
            { AIPhone: withoutPlus },
          ],
        },
      });

      if (user?.businessName) {
        businessName = user.businessName;
        console.log("Found business name:", businessName);
      }
      if (user?.knowledgeBase) {
        knowledgeBase = user.knowledgeBase;
      }
      if (user?.callHandlingRules) {
        callHandlingRules = user.callHandlingRules;
      }
    } catch (e) {
      console.error("DB error during lookup:", e);
    }

    const voicePipelineAgent = new voice.VoicePipelineAgent({
      stt: new deepgram.STT(),
      tts: new cartesia.TTS(),
      llm: new openai.LLM({
        model: "gpt-4o-mini",
        instructions: `You are the AI receptionist for ${businessName}.
        
Business Knowledge:
${knowledgeBase}

Call Handling Rules:
${callHandlingRules}

Your goal is to be helpful and professional. Keep your responses concise.`,
      }),
    });

    voicePipelineAgent.start(ctx.room);
    console.log("Agent started!");
    voicePipelineAgent.say(`Hi, thanks for calling ${businessName}. This is Solomon!`);
  },
});
