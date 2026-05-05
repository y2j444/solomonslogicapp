import "dotenv/config";
import { cli } from "@livekit/agents";
import agent from "./receptionist.js";

// Enable detailed debug logging
process.env.DEBUG = "livekit:*";

console.log("Launching Solomon Agent with Direct Import...");

cli.runApp({
  agent: agent,
});
