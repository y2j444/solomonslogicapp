"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var receptionist_exports = {};
__export(receptionist_exports, {
  default: () => receptionist_default
});
module.exports = __toCommonJS(receptionist_exports);
var import_agents = require("@livekit/agents");
var openai = __toESM(require("@livekit/agents-plugin-openai"), 1);
var deepgram = __toESM(require("@livekit/agents-plugin-deepgram"), 1);
var cartesia = __toESM(require("@livekit/agents-plugin-cartesia"), 1);
var import_prisma = require("../src/lib/prisma");
var receptionist_default = (0, import_agents.defineAgent)({
  request_handler: async (req) => {
    console.log("--- Received Job Request ---");
    console.log("Job ID:", req.job.id);
    console.log("Job Type:", req.job.type);
    await req.accept();
  },
  entrypoint: async (ctx) => {
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
      const roomPrefix = ctx.room.name.split(/[-_]/)[0];
      let rawNumber = ctx.room.metadata || roomPrefix || process.env.TELNYX_PHONE_NUMBER || "";
      if (typeof rawNumber === "object") {
        rawNumber = JSON.stringify(rawNumber);
      }
      const calledNumber = rawNumber.trim();
      const withPlus = calledNumber.startsWith("+") ? calledNumber : "+" + calledNumber;
      const withoutPlus = calledNumber.replace("+", "");
      console.log("Looking up business for number:", calledNumber, "or", withPlus);
      const user = await import_prisma.prisma.user.findFirst({
        where: {
          OR: [
            { AIPhone: calledNumber },
            { AIPhone: withPlus },
            { AIPhone: withoutPlus }
          ]
        }
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
    const agent = new import_agents.voice.VoicePipelineAgent({
      stt: new deepgram.STT(),
      tts: new cartesia.TTS(),
      llm: new openai.LLM({
        model: "gpt-4o-mini",
        instructions: `You are the AI receptionist for ${businessName}.
        
Business Knowledge:
${knowledgeBase}

Call Handling Rules:
${callHandlingRules}

Your goal is to be helpful and professional, using the knowledge above to answer questions and following the rules strictly. Keep your responses concise.`
      })
    });
    agent.start(ctx.room);
    console.log("Agent started!");
    agent.say(`Hi, thanks for calling ${businessName}. This is Solomon!`);
  }
});
