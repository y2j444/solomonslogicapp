/**
 * test_ai_caller.ts
 * 
 * Dispatches the "sales-pitcher" LiveKit agent for an outbound cold call.
 * The agent connects to a LiveKit room, then dials the target via the Telnyx SIP trunk.
 * 
 * Usage: npx tsx scratch/test_ai_caller.ts
 */

import * as dotenv from "dotenv";
import { AgentDispatchClient } from "livekit-server-sdk";

dotenv.config();

const TARGET_PHONE = "+17169394226"; // Mike (test)
const TARGET_NAME = "Mike";
const BUSINESS_NAME = "Solomon's Logic Test";

async function main() {
  console.log("\n📞 Solomon's Logic — AI Outbound Sales Pitcher");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🎯 Target: ${TARGET_NAME} at ${BUSINESS_NAME}`);
  console.log(`📱 Phone: ${TARGET_PHONE}`);
  console.log(`🎙️  Voice: Marcus (deep male, OpenAI onyx)`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const lkUrl = process.env.LIVEKIT_URL || "";
  const apiKey = process.env.LIVEKIT_API_KEY || "";
  const apiSecret = process.env.LIVEKIT_API_SECRET || "";

  if (!lkUrl || !apiKey || !apiSecret) {
    console.error("❌ Missing LIVEKIT_URL, LIVEKIT_API_KEY, or LIVEKIT_API_SECRET in .env");
    process.exit(1);
  }

  const dispatchClient = new AgentDispatchClient(lkUrl, apiKey, apiSecret);

  // Create a unique room for this call
  const roomName = `outbound-${Date.now()}`;

  console.log(`📡 Dispatching sales-pitcher agent to room: ${roomName}`);
  console.log(`🔄 Agent will connect, then dial ${TARGET_PHONE}...`);

  try {
    const dispatch = await dispatchClient.createDispatch(
      roomName,
      "sales-pitcher", // Must match agentName in ServerOptions
      {
        metadata: JSON.stringify({
          phone: TARGET_PHONE,
          name: BUSINESS_NAME,
          leadName: TARGET_NAME,
        }),
      }
    );

    console.log(`\n✅ Dispatch created! ID: ${dispatch.dispatchId}`);
    console.log(`\n📲 Your phone (${TARGET_PHONE}) will ring in ~5 seconds.`);
    console.log("   Pick up and Marcus will pitch you!\n");
    console.log("Press Ctrl+C to stop monitoring.");
  } catch (err: any) {
    console.error("\n❌ Dispatch failed:", err.message);
    console.error("Make sure the sales-pitcher agent worker is running on Railway with AGENT_TYPE=sales-pitcher");
  }
}

main();
