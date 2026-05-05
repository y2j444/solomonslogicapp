import "dotenv/config";
import { cli } from "@livekit/agents";
import receptionist from "./receptionist.ts";

console.log("Launching Solomon Agent...");

// Using the direct receptionist object so its name ('solomon-agent') is visible to LiveKit
cli.runApp(receptionist);
