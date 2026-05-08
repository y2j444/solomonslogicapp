import dotenv from "dotenv";
dotenv.config(); 

import { cli, ServerOptions } from "@livekit/agents";

// Enable detailed debug logging
process.env.DEBUG = "livekit:*";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from "fs";

console.log("Launching Solomon Agent...");

// Simple pathing: In production (dist), everything is in the same folder.
// In dev, tsx handles the resolution.
const agentPath = path.join(__dirname, "receptionist.js");

cli.runApp(new ServerOptions({
  agent: agentPath,
  apiKey: process.env.LIVEKIT_API_KEY,
  apiSecret: process.env.LIVEKIT_API_SECRET,
  host: "0.0.0.0",
  initializeProcessTimeout: 120,
  loadThreshold: 0.85,
}));
