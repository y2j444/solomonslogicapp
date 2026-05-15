import dotenv from "dotenv";
dotenv.config(); 

import { cli, ServerOptions } from "@livekit/agents";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enable detailed debug logging
process.env.DEBUG = "livekit:*";

console.log("Launching Solomon Agent...");

// Dynamic pathing for Dev vs Production
const isDev = !__filename.includes('dist');
const agentFile = isDev ? "receptionist.ts" : "receptionist.js";
const agentPath = pathToFileURL(path.join(__dirname, agentFile)).href;

console.log(`[Worker] Starting in multi-process mode. Agent path: ${agentPath}`);

cli.runApp(new ServerOptions({
  agent: agentPath,
  apiKey: process.env.LIVEKIT_API_KEY,
  apiSecret: process.env.LIVEKIT_API_SECRET,
  host: "0.0.0.0",
  port: parseInt(process.env.PORT || "8081"),
  numIdleProcesses: 0, // Disable idle processes for Railway stability
  initializeProcessTimeout: 300, 
  loadThreshold: 0.85,
}));
