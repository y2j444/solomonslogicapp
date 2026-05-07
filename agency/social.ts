import { OpenAI } from "openai";

export async function socialAgent(task: string) {
  const openai = new OpenAI();
  console.log("[Social] Crafting high-conversion posts for Solomon's Logic...");

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { 
        role: "system", 
        content: `You are the Social Media Manager for Solomon's Logic, an AI Automation Agency in Franklin, TN.
        Your goal is to generate engaging, professional content for Facebook and LinkedIn.
        
        Focus on:
        1. The benefit of AI Receptionists (No more missed calls, 24/7 service).
        2. Local focus (Helping Franklin/Nashville businesses grow).
        3. Professional tone for LinkedIn, more friendly/community-focused for Facebook.
        
        Output format: JSON with 'linkedinPost' and 'facebookPost' fields. Include hashtags and image prompts.` 
      },
      { role: "user", content: task }
    ],
    response_format: { type: "json_object" }
  });

  const content = response.choices[0].message.content;
  if (!content) return;

  const posts = JSON.parse(content);
  
  let report = `--- LinkedIn Post ---\n${posts.linkedinPost}\n\n--- Facebook Post ---\n${posts.facebookPost}`;
  if (posts.imagePrompt) {
    report += `\n\n--- AI Image Prompt ---\n${posts.imagePrompt}`;
  }

  console.log(report);
  return report;
}
