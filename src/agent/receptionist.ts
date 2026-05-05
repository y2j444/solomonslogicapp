import { 
  defineAgent, 
  multimodal, 
  type JobContext 
} from "@livekit/agents";
import * as openai from "@livekit/agents-plugin-openai";
import { prisma } from "../lib/prisma";

export default defineAgent((ctx: JobContext) => {
  return {
    entry: async (ctx: JobContext) => {
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
      
      const agent = new multimodal.MultimodalAgent({
        model: new openai.realtime.RealtimeModel({
          instructions: `You are Solomon, the AI receptionist for ${businessName}. Warm and helpful.`
        }),
      });

      await agent.start(ctx.room);
      await agent.say(`Hi, thanks for calling ${businessName}, this is Solomon. How can I help you?`);
    }
  };
});
