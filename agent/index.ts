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

// Dynamic pathing for Dev vs Production
const isDev = !__filename.includes('dist');
const agentFile = isDev ? "receptionist.ts" : "receptionist.js";
const agentPath = path.join(__dirname, agentFile);
console.log(`[Worker] Using agent path: ${agentPath}`);

cli.runApp(new ServerOptions({
  agent: agentPath,
  apiKey: process.env.LIVEKIT_API_KEY,
  apiSecret: process.env.LIVEKIT_API_SECRET,
  host: "0.0.0.0",
  port: parseInt(process.env.PORT || "8081"), // Crucial for Railway health checks
  initializeProcessTimeout: 120,
  loadThreshold: 0.85,
}));
