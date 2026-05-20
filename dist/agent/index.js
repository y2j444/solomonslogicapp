// agent/index.ts
import dotenv from "dotenv";
import { cli, ServerOptions } from "@livekit/agents";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
process.env.DEBUG = "livekit:*";
console.log("Launching Solomon Agent...");
var isDev = !__filename.includes("dist");
var agentFile = isDev ? "receptionist.ts" : "receptionist.js";
var agentPath = path.join(__dirname, agentFile);
console.log(`[Worker] Starting in multi-process mode. Agent path: ${agentPath}`);
cli.runApp(new ServerOptions({
  agent: agentPath,
  agentName: "solomon",
  // Explicitly named for the Dispatch Rule
  apiKey: process.env.LIVEKIT_API_KEY,
  apiSecret: process.env.LIVEKIT_API_SECRET,
  host: "0.0.0.0",
  port: parseInt(process.env.PORT || "8081"),
  numIdleProcesses: -1,
  // MUST be -1 to bypass LiveKit's falsy check (0 || 3 evaluates to 3)
  initializeProcessTimeout: 300,
  loadThreshold: 0.85
}));
//# sourceMappingURL=index.js.map
