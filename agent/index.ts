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

// AGENT_TYPE can be "receptionist" (default), "sales-pitcher", or "vending-pitcher"
const agentType = process.env.AGENT_TYPE || "receptionist";

console.log(`Launching Solomon Agent (type=${agentType})...`);

// Dynamic pathing for Dev vs Production
const isDev = !__filename.includes("dist");

let agentFile: string;
let agentName: string;

if (agentType === "sales-pitcher") {
  agentFile = isDev ? "sales-pitcher.ts" : "sales-pitcher.js";
  agentName = "sales-pitcher";
} else if (agentType === "vending-pitcher") {
  agentFile = isDev ? "vending-pitcher.ts" : "vending-pitcher.js";
  agentName = "vending-pitcher";
} else {
  agentFile = isDev ? "receptionist.ts" : "receptionist.js";
  agentName = "solomon";
}

const agentPath = path.join(__dirname, agentFile);

// -1 disables the warm process pool. In JS, 0 is treated as "use default" (4 idle procs).
// A stale/dead warmed proc causes ERR_IPC_CHANNEL_CLOSED and the whole worker crashes (no answer).
const numIdleProcesses = -1;

console.log(
  `[Worker] Agent path: ${agentPath}, name: ${agentName} (production=${isProduction}, idleProcesses=${numIdleProcesses})`
);

process.on("uncaughtException", (err) => {
  console.error("[Worker] uncaughtException:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[Worker] unhandledRejection:", reason);
});

cli.runApp(
  new ServerOptions({
    agent: agentPath,
    agentName,
    apiKey: process.env.LIVEKIT_API_KEY,
    apiSecret: process.env.LIVEKIT_API_SECRET,
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "8081"),
    production: isProduction,
    numIdleProcesses,
    // LiveKit uses milliseconds (default 10_000). 300 was only 0.3s and caused flaky child init.
    initializeProcessTimeout: 120_000,
    shutdownProcessTimeout: 120_000,
  })
);
