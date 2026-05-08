import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ override: true });
}
import { cli, ServerOptions } from "@livekit/agents";

// Enable detailed debug logging
process.env.DEBUG = "livekit:*";

console.log("Launching Solomon Agent...");
console.log("Checking Credentials...");
console.log("- LIVEKIT_URL:", process.env.LIVEKIT_URL ? "FOUND" : "MISSING");
console.log("- LIVEKIT_API_KEY:", process.env.LIVEKIT_API_KEY ? "FOUND" : "MISSING");
console.log("- LIVEKIT_API_SECRET:", process.env.LIVEKIT_API_SECRET ? "FOUND" : "MISSING");
console.log("- OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "FOUND" : "MISSING");

cli.runApp(new ServerOptions({
  agent: "agent/receptionist.ts",
  apiKey: process.env.LIVEKIT_API_KEY,
  apiSecret: process.env.LIVEKIT_API_SECRET,
  host: "0.0.0.0", // Essential for Railway to monitor the process
  initializeProcessTimeout: 120,
  loadThreshold: 0.85,
}));
