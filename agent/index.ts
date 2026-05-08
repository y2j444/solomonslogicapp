import dotenv from "dotenv";
dotenv.config(); 

import { cli, ServerOptions } from "@livekit/agents";

// Enable detailed debug logging
process.env.DEBUG = "livekit:*";

import path from "path";

console.log("Launching Solomon Agent...");

process.on("uncaughtException", (err) => {
  console.error("CRITICAL: Uncaught Exception in Main Process:", err);
});

cli.runApp(new ServerOptions({
  agent: path.resolve(__dirname, "receptionist.ts"),
  apiKey: process.env.LIVEKIT_API_KEY,
  apiSecret: process.env.LIVEKIT_API_SECRET,
  host: "0.0.0.0",
  initializeProcessTimeout: 120,
  loadThreshold: 0.85,
}));
