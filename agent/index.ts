import dotenv from "dotenv";
dotenv.config(); 

import { cli, ServerOptions } from "@livekit/agents";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import receptionist from "./receptionist.js";

// Enable detailed debug logging
process.env.DEBUG = "livekit:*";

console.log("Launching Solomon Agent in Single-Process Mode...");

cli.runApp(new ServerOptions({
  agent: receptionist,
  apiKey: process.env.LIVEKIT_API_KEY,
  apiSecret: process.env.LIVEKIT_API_SECRET,
  host: "0.0.0.0",
  port: parseInt(process.env.PORT || "8081"),
  initializeProcessTimeout: 120,
  loadThreshold: 0.85,
}));
