import { 
  defineAgent, 
  VoicePipelineAgent, 
  type JobContext 
} from "@livekit/agents";
import * as openai from "@livekit/agents-plugin-openai";
import * as deepgram from "@livekit/agents-plugin-deepgram";
import * as cartesia from "@livekit/agents-plugin-cartesia";
import { prisma } from "../src/lib/prisma";

export default defineAgent(async (ctx: JobContext) => {
  console.log("Incoming call detected...");
  
  await ctx.connect();
  console.log("Agent joined the room!");

  // Wrap the DB lookup in a try/catch so it never blocks the call
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
    console.error("DB lookup failed, using default name:", e);
  }

  const agent = new VoicePipelineAgent({
    stt: new deepgram.STT(),
    tts: new cartesia.TTS(),
    llm: new openai.LLM({
      model: "gpt-4o-mini",
      instructions: `You are Solomon, the AI receptionist for ${businessName}. Warm and professional.`,
    }),
  });

  agent.start(ctx.room);
  
  // Explicitly greet the caller
  setTimeout(() => {
    agent.say(`Hi, thanks for calling ${businessName}, this is Solomon. How can I help you today?`);
  }, 500);
});
