import "dotenv/config";
import { cli } from "@livekit/agents";
import path from "node:path";

// Enable detailed debug logging
process.env.DEBUG = "livekit:*";

console.log("Launching Solomon Agent with Debug Mode...");
console.log("Current Directory:", process.cwd());
console.log("Agent Path:", path.join(process.cwd(), "agent/receptionist.ts"));

// Using a relative path for the agent file is often more reliable on Windows
cli.runApp({
  agent: "./agent/receptionist.ts",
});
