import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ override: true });
}
import { cli, ServerOptions } from "@livekit/agents";

// Enable detailed debug logging
process.env.DEBUG = "livekit:*";

console.log("Launching Solomon Agent...");

cli.runApp(new ServerOptions({
  agent: "agent/receptionist.ts",
  initializeProcessTimeout: 120, // Doubled the timeout for better stability
  loadThreshold: 0.85, // Slightly higher threshold to allow more breathing room
}));
