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
  await ctx.connect();
  console.log("Agent connected to room:", ctx.room.name);

  const calledNumber = ctx.room.metadata || process.env.TELNYX_PHONE_NUMBER; 
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { twilioPhone: calledNumber },
        { twilioPhone: calledNumber?.replace("+1", "") },
      ],
    },
  });

  const businessName = user?.businessName || "Solomon's Logic";
  const knowledge = process.env.RECEPTIONIST_KNOWLEDGE || "We provide AI receptionist services.";

  const agent = new VoicePipelineAgent({
    stt: new deepgram.STT(),
    tts: new cartesia.TTS(),
    llm: new openai.LLM({
      model: "gpt-4o-mini",
      instructions: `
        You are Solomon, the AI receptionist for ${businessName}.
        Professional, warm, and helpful.
        
        KNOWLEDGE:
        ${knowledge}
      `,
    }),
  });

  await agent.start(ctx.room);
  await agent.say(`Hi, thanks for calling ${businessName}, this is Solomon. How can I help you today?`);
});
