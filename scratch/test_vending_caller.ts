import { RoomServiceClient } from "livekit-server-sdk";
import dotenv from "dotenv";
dotenv.config();

/**
 * Utility script to dispatch the Vending Machine AI Pitcher to a specific phone number.
 * Usage: npx ts-node scratch/test_vending_caller.ts "+17169394226" "Gym Name" "Mike"
 */

const LK_URL = process.env.LIVEKIT_URL || "";
const LK_API_KEY = process.env.LIVEKIT_API_KEY || "";
const LK_API_SECRET = process.env.LIVEKIT_API_SECRET || "";

const targetPhone = process.argv[2] || "+17169394226";
const targetName = process.argv[3] || "the office";
const targetLead = process.argv[4] || "there";

async function main() {
  console.log("-----------------------------------------");
  console.log("🤖 VENDING MACHINE AI PITCHER DISPATCH");
  console.log("-----------------------------------------");

  if (!LK_URL || !LK_API_KEY || !LK_API_SECRET) {
    console.error("❌ LiveKit credentials missing in .env");
    return;
  }

  const roomService = new RoomServiceClient(
    LK_URL.replace("wss://", "https://"),
    LK_API_KEY,
    LK_API_SECRET
  );

  const roomName = `vending-pitch-${Date.now()}`;

  try {
    console.log(`📡 Creating dispatch for ${targetPhone}...`);
    
    // Create the dispatch pointing to the new "vending-pitcher" agent
    const dispatch = await roomService.createAgentDispatch(
      roomName,
      "vending-pitcher",
      {
        metadata: JSON.stringify({
          phone: targetPhone,
          name: targetName,
          leadName: targetLead
        }),
      }
    );

    console.log(`\n✅ Dispatch created! ID: ${dispatch.id}`);
    console.log(`\n📲 Your phone (${targetPhone}) will ring in ~5 seconds.`);
    console.log("   Pick up and Marcus will pitch you on the AI Vending Machines!\n");
    
  } catch (error: any) {
    console.error("❌ Dispatch failed:", error.message);
  }
}

main();
