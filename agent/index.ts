import * as dotenv from "dotenv";
dotenv.config({ override: true });
import { cli } from "@livekit/agents";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Enable detailed debug logging
process.env.DEBUG = "livekit:*";

console.log("Launching Solomon Agent...");

const agentPath = pathToFileURL(path.resolve(process.cwd(), "agent/receptionist.ts")).href;
console.log("Agent Path:", agentPath);

cli.runApp({
  agent: agentPath,
});
