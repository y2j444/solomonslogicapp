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

const agentDef = defineAgent({
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
    try {
      const calledNumber = ctx.room.metadata || process.env.TELNYX_PHONE_NUMBER; 
      console.log("Looking up business for number:", calledNumber);
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { twilioPhone: calledNumber },
            { twilioPhone: calledNumber?.replace("+1", "") },
          ],
        },
      });
      if (user?.businessName) {
        businessName = user.businessName;
        console.log("Found business name:", businessName);
      }
    } catch (e) {
      console.error("DB error during lookup:", e);
    }

    const agent = new voice.VoicePipelineAgent({
      stt: new deepgram.STT(),
      tts: new cartesia.TTS(),
      llm: new openai.LLM({
        model: "gpt-4o-mini",
        instructions: `You are Solomon, the AI receptionist for ${businessName}. Your goal is to be helpful and professional.`,
      }),
    });

    agent.start(ctx.room);
    console.log("Agent started!");
    agent.say(`Hi, thanks for calling ${businessName}. This is Solomon!`);
  },
});

export default agentDef;
