import dotenv from "dotenv";
dotenv.config(); 

import { cli, ServerOptions } from "@livekit/agents";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === "production";

// Verbose LiveKit debug floods Railway logs and can stall the worker IPC ping loop.
if (!isProduction) {
  process.env.DEBUG = "livekit:*";
}

console.log("Launching Solomon Agent...");

// Dynamic pathing for Dev vs Production
const isDev = !__filename.includes("dist");
const agentFile = isDev ? "receptionist.ts" : "receptionist.js";
const agentPath = path.join(__dirname, agentFile);

console.log(
  `[Worker] Agent path: ${agentPath} (production=${isProduction}, idleProcesses=${isProduction ? 1 : 0})`
);

cli.runApp(
  new ServerOptions({
    agent: agentPath,
    agentName: "solomon", // Explicitly named for the Dispatch Rule
    apiKey: process.env.LIVEKIT_API_KEY,
    apiSecret: process.env.LIVEKIT_API_SECRET,
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "8081"),
    production: isProduction,
    // Reuse one warmed job process in production (avoids cold-start races / orphaned IPC).
    numIdleProcesses: isProduction ? 1 : 0,
    initializeProcessTimeout: 300,
  })
);
