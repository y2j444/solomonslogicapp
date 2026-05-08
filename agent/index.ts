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
  apiKey: process.env.LIVEKIT_API_KEY,
  apiSecret: process.env.LIVEKIT_API_SECRET,
  host: process.env.LIVEKIT_URL,
  initializeProcessTimeout: 120,
  loadThreshold: 0.85,
}));
