import dotenv from "dotenv";
dotenv.config(); 

import { cli, ServerOptions } from "@livekit/agents";
import path from "path";
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
