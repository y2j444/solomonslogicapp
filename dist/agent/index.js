// agent/index.ts
import dotenv from "dotenv";
import { cli, ServerOptions } from "@livekit/agents";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var isProduction = process.env.NODE_ENV === "production";
if (!isProduction) {
  process.env.DEBUG = "livekit:*";
}
console.log("Launching Solomon Agent...");
var isDev = !__filename.includes("dist");
var agentFile = isDev ? "receptionist.ts" : "receptionist.js";
var agentPath = path.join(__dirname, agentFile);
var numIdleProcesses = -1;
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
    agentName: "solomon",
    // Explicitly named for the Dispatch Rule
    apiKey: process.env.LIVEKIT_API_KEY,
    apiSecret: process.env.LIVEKIT_API_SECRET,
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "8081"),
    production: isProduction,
    numIdleProcesses,
    // LiveKit uses milliseconds (default 10_000). 300 was only 0.3s and caused flaky child init.
    initializeProcessTimeout: 12e4,
    shutdownProcessTimeout: 12e4
  })
);
//# sourceMappingURL=index.js.map
