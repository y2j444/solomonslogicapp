import "dotenv/config";
import { cli, ServerOptions } from "@livekit/agents";
import path from "node:path";

const agentPath = path.join(process.cwd(), "src/agent/receptionist.ts");

console.log("Launching Solomon Agent...");

// Using the strict ServerOptions type to satisfy the production build
cli.runApp(new ServerOptions({
  agent: agentPath,
}));
