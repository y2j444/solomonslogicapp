import "dotenv/config";
import { cli, ServerOptions } from "@livekit/agents";
import path from "node:path";

// Now correctly pointing to the new folder location
const agentPath = path.join(process.cwd(), "agent/receptionist.ts");

console.log("Launching Solomon Agent from root/agent folder...");

cli.runApp(new ServerOptions({
  agent: agentPath,
  apiKey: process.env.LIVEKIT_API_KEY,
  apiSecret: process.env.LIVEKIT_API_SECRET,
  host: process.env.LIVEKIT_URL?.replace("wss://", "").replace("https://", ""),
}));
