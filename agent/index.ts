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

// -1 disables the warm process pool. In JS, 0 is treated as "use default" (4 idle procs).
// A stale/dead warmed proc causes ERR_IPC_CHANNEL_CLOSED and the whole worker crashes (no answer).
const numIdleProcesses = -1;

console.log(
  `[Worker] Agent path: ${agentPath} (production=${isProduction}, idleProcesses=${numIdleProcesses})`
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
    agentName: "solomon", // Explicitly named for the Dispatch Rule
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
