import dotenv from "dotenv";
dotenv.config({ override: true });
import { cli, ServerOptions } from "@livekit/agents";

// Enable detailed debug logging
process.env.DEBUG = "livekit:*";

console.log("Launching Solomon Agent...");

cli.runApp(new ServerOptions({
  agent: "agent/receptionist.ts",
  initializeProcessTimeout: 60,
  loadThreshold: 0.8,
}));
