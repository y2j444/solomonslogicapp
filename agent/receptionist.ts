import { 
  defineAgent, 
  voice, 
  type JobContext 
} from "@livekit/agents";
import * as openai from "@livekit/agents-plugin-openai";
import * as deepgram from "@livekit/agents-plugin-deepgram";
import * as cartesia from "@livekit/agents-plugin-cartesia";
import { prisma } from "../src/lib/prisma";

export default defineAgent(async (ctx: JobContext) => {
  console.log("Call received! Connecting...");
  await ctx.connect();
  
  let businessName = "Solomon's Logic";
  try {
    const calledNumber = ctx.room.metadata || process.env.TELNYX_PHONE_NUMBER; 
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { twilioPhone: calledNumber },
          { twilioPhone: calledNumber?.replace("+1", "") },
        ],
      },
    });
    if (user?.businessName) businessName = user.businessName;
  } catch (e) {
    console.error("DB error:", e);
  }

  // Correct path for your version: voice.VoicePipelineAgent
  const agent = new voice.VoicePipelineAgent({
    stt: new deepgram.STT(),
    tts: new cartesia.TTS(),
    llm: new openai.LLM({
      model: "gpt-4o-mini",
      instructions: `You are Solomon, the AI receptionist for ${businessName}.`,
    }),
  });

  agent.start(ctx.room);
  agent.say(`Hi, thanks for calling ${businessName}. This is Solomon!`);
});
