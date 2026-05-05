import "dotenv/config";
import { cli } from "@livekit/agents";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Enable detailed debug logging
process.env.DEBUG = "livekit:*";

const agentPath = pathToFileURL(path.resolve(process.cwd(), "agent/receptionist.ts")).href;
console.log("Launching Solomon Agent...");
console.log("Agent URL:", agentPath);

cli.runApp({
  agent: agentPath,
});
