import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local", override: true });

// Clean the API key (remove quotes or spaces)
if (process.env.OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY.trim().replace(/^["']|["']$/g, "");
  const key = process.env.OPENAI_API_KEY;
  console.log(`[PM] Using API Key: ${key.substring(0, 7)}...${key.substring(key.length - 3)}`);
}

import { OpenAI } from "openai";
import { prisma } from "../src/lib/prisma";
import { outreachAgent } from "./outreach";
import { socialAgent } from "./social";

export async function runAgencyTask(task: string) {
  if (!process.env.OPENAI_API_KEY?.startsWith("sk-")) {
    throw new Error("Invalid or missing OPENAI_API_KEY in environment.");
  }
  const openai = new OpenAI();
  console.log(`[PM] New Task: "${task}"`);

  const taskLower = task.toLowerCase();

  if (taskLower.includes("social") || taskLower.includes("facebook") || taskLower.includes("linkedin") || taskLower.includes("post")) {
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

if (require.main === module || process.argv[1]?.includes("pm.ts")) {
  main().catch(console.error);
}
