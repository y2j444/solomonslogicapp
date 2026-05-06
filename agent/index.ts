import * as dotenv from "dotenv";
dotenv.config({ override: true });
import { cli } from "@livekit/agents";
import path from "node:path";

// Enable detailed debug logging
process.env.DEBUG = "livekit:*";

console.log("Launching Solomon Agent...");

cli.runApp({
  agent: path.join(process.cwd(), "agent/receptionist.ts"),
});
