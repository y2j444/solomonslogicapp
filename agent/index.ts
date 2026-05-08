import dotenv from "dotenv";
dotenv.config(); 

import { cli, ServerOptions } from "@livekit/agents";

// Enable detailed debug logging
process.env.DEBUG = "livekit:*";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from "fs";

console.log("Launching Solomon Agent...");

// Dual-mode pathing: Check for compiled .js (prod) or raw .ts (dev)
let agentPath = path.join(__dirname, "receptionist.js");
if (!fs.existsSync(agentPath)) {
  agentPath = path.join(__dirname, "receptionist.ts");
}

console.log(`[Debug] Using agent at: ${agentPath}`);

process.on("uncaughtException", (err) => {
  console.error("CRITICAL: Uncaught Exception in Main Process:", err);
});

cli.runApp(new ServerOptions({
  agent: agentPath,
  apiKey: process.env.LIVEKIT_API_KEY,
  apiSecret: process.env.LIVEKIT_API_SECRET,
  host: "0.0.0.0",
  initializeProcessTimeout: 120,
  loadThreshold: 0.85,
}));
