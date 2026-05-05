import { 
  defineAgent, 
  voice
} from "@livekit/agents";
import * as openai from "@livekit/agents-plugin-openai";
import * as deepgram from "@livekit/agents-plugin-deepgram";
import * as cartesia from "@livekit/agents-plugin-cartesia";

export default defineAgent({
  request_handler: async (req) => {
    console.log("--- Received Job Request ---");
    await req.accept();
  },
  entry: async (ctx) => {
    console.log("--- Job Started ---");
    await ctx.connect();
    console.log("Connected to room!");

    const businessName = "Solomon's Logic";

    const agent = new voice.VoicePipelineAgent({
      stt: new deepgram.STT(),
      tts: new cartesia.TTS(),
      llm: new openai.LLM({
        model: "gpt-4o-mini",
        instructions: `You are Solomon, the AI receptionist for ${businessName}.`,
      }),
    });

    agent.start(ctx.room);
    console.log("Agent started!");
    agent.say(`Hi, thanks for calling ${businessName}. This is Solomon!`);
  },
});
