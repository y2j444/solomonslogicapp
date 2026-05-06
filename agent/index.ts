import dotenv from "dotenv";
dotenv.config({ override: true });
import { cli } from "@livekit/agents";

// Enable detailed debug logging
process.env.DEBUG = "livekit:*";

console.log("Launching Solomon Agent...");

cli.runApp({
  agent: "agent/receptionist.ts",
});
