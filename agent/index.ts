import * as dotenv from "dotenv";
dotenv.config({ override: true });
import { cli } from "@livekit/agents";
import receptionist from "./receptionist.js";

// Enable detailed debug logging
process.env.DEBUG = "livekit:*";

console.log("Launching Solomon Agent...");

cli.runApp({
  agent: receptionist,
});
