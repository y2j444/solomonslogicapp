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
console.log(
  `[Worker] Agent path: ${agentPath} (production=${isProduction}, idleProcesses=${isProduction ? 1 : 0})`
);
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
    // Reuse one warmed job process in production (avoids cold-start races / orphaned IPC).
    numIdleProcesses: isProduction ? 1 : 0,
    initializeProcessTimeout: 300
  })
);
//# sourceMappingURL=index.js.map
