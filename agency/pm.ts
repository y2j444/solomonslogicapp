import * as dotenv from "dotenv";
import path from "path";

// In production (Vercel), environment variables are already in process.env.
// We only need to load .env.local manually when running as a standalone script locally.
if (!process.env.OPENAI_API_KEY) {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });
}

// Clean the API key (remove quotes or spaces)
if (process.env.OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY.trim().replace(/^["']|["']$/g, "");
}

import { OpenAI } from "openai";
import { prisma } from "../src/lib/prisma";
import { outreachAgent } from "./outreach";
import { socialAgent } from "./social";
import { ghostPost } from "./ghost_poster";

export async function runAgencyTask(task: string) {
  if (!process.env.OPENAI_API_KEY?.startsWith("sk-")) {
    throw new Error("Invalid or missing OPENAI_API_KEY in environment.");
  }
  const openai = new OpenAI();
  console.log(`[PM] New Task: "${task}"`);

  const taskLower = task.toLowerCase();

  if (taskLower.includes("publish") || taskLower.includes("post now") || (taskLower.includes("ghost") && taskLower.includes("post"))) {
    console.log("[PM] Delegating to Social Ghost for automated posting...");
    const platform = taskLower.includes("linkedin") ? "linkedin" : 
                     taskLower.includes("facebook") ? "facebook" : 
                     taskLower.includes("google") ? "google" : "linkedin";
    
    return await ghostPost(platform, task);
  } else if (taskLower.includes("social") || taskLower.includes("facebook") || taskLower.includes("linkedin") || taskLower.includes("post")) {
    console.log("[PM] Delegating to Social Media Agent...");
    return await socialAgent(task);
  } else if (taskLower.includes("find") || taskLower.includes("customer") || taskLower.includes("lead")) {
    console.log("[PM] Delegating to Outreach Agent...");
    return await outreachAgent(task);
  } else {
    const openai = new OpenAI();
    console.log("[PM] I'm not sure which agent handles that yet. I'll try to help directly.");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are the Project Manager for Solomon's Logic, an AI automation agency. Help the user plan their business growth." },
        { role: "user", content: task }
      ]
    });
    return response.choices[0].message.content;
  }
}

async function main() {
  const task = process.argv.slice(2).join(" ");
  
  if (!task) {
    console.log("Welcome to Solomon's Logic Agency.");
    console.log("Usage: npm run agency \"Your task here\"");
    return;
  }

  const result = await runAgencyTask(task);
  console.log(result);
}

if (process.argv[1]?.includes("pm.ts")) {
  main().catch(console.error);
}
