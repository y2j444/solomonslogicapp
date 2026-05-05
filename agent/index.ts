import "dotenv/config";
import { cli, ServerOptions } from "@livekit/agents";
import path from "node:path";

const agentPath = path.join(process.cwd(), "agent/receptionist.ts");

console.log("Launching Solomon Agent...");

// Removed the 'host' line that was causing the local binding error
cli.runApp(new ServerOptions({
  agent: agentPath,
  apiKey: process.env.LIVEKIT_API_KEY,
  apiSecret: process.env.LIVEKIT_API_SECRET,
}));
