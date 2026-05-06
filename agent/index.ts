import dotenv from "dotenv";
dotenv.config({ override: true });
import { cli } from "@livekit/agents";

// Enable detailed debug logging
process.env.DEBUG = "livekit:*";

console.log("Launching Solomon Agent...");

cli.runApp({
  agent: "agent/receptionist.ts",
  workerOptions: {
    jobInitTimeout: 60000, // 60s for very high load systems
    watchdogTimeout: 45000, // 45s for very high load systems
    loadThreshold: 0.8, // Don't take new jobs if CPU is > 80%
  }
});
