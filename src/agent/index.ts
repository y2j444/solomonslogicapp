import "dotenv/config";
import { cli } from "@livekit/agents";
import path from "node:path";

// No need to pass keys manually—LiveKit will look for 
// LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET in your .env
const agentPath = path.join(process.cwd(), "src/agent/receptionist.ts");

console.log("Launching Solomon Agent...");

cli.runApp({
  agent: agentPath,
});
