import "dotenv/config";
import { cli } from "@livekit/agents";
import path from "node:path";

console.log("Launching Solomon Agent...");

// Using the file path method so Dev Mode (auto-reload) works correctly
cli.runApp({
  agent: path.join(process.cwd(), "agent/receptionist.ts"),
});
