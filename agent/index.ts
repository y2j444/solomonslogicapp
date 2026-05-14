import dotenv from "dotenv";
dotenv.config(); 

import { cli, ServerOptions } from "@livekit/agents";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Enable detailed debug logging
process.env.DEBUG = "livekit:*";

console.log("Launching Solomon Agent in Single-Process Mode...");

// Dynamic pathing for Dev vs Production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = !__filename.includes('dist');
const agentFile = isDev ? "receptionist.ts" : "receptionist.js";
const agentPath = path.join(__dirname, agentFile);

console.log(`[Worker] Starting in multi-process mode. Agent path: ${agentPath}`);

cli.runApp(new ServerOptions({
  agent: agentPath,
  apiKey: process.env.LIVEKIT_API_KEY,
  apiSecret: process.env.LIVEKIT_API_SECRET,
  host: "0.0.0.0",
  port: parseInt(process.env.PORT || "8081"),
  initializeProcessTimeout: 300, // 5 minutes to allow for slow Railway initialization
  loadThreshold: 0.85,
}));
