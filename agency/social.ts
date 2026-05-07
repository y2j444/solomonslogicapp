import { OpenAI } from "openai";

export async function socialAgent(task: string) {
  try {
    const openai = new OpenAI();
    console.log("[Social] Crafting high-conversion posts for Solomon's Logic...");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are the Social Media Manager for Solomon's Logic, an AI Automation Agency in Franklin, TN.
          Your goal is to generate engaging, professional content for Facebook, LinkedIn, and Google Business Profile.
          Output format: JSON with 'linkedinPost', 'facebookPost', and 'googleBusinessPost' fields. Include hashtags and image prompts.` 
        },
        { role: "user", content: task }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) return "Error: Social Agent failed to generate content.";

    const posts = JSON.parse(content);
    
    const linkedin = posts.linkedinPost || "LinkedIn post draft failed.";
    const facebook = posts.facebookPost || "Facebook post draft failed.";
    const google = posts.googleBusinessPost || "Google Business post draft failed.";

    let report = `--- LinkedIn Post ---\n${linkedin}\n\n--- Facebook Post ---\n${facebook}\n\n--- Google Business Profile Post ---\n${google}`;
    if (posts.imagePrompt) {
      report += `\n\n--- AI Image Prompt ---\n${posts.imagePrompt}`;
    }

    return report;
  } catch (error: any) {
    console.error("[Social] Fatal Error:", error);
    return `Error: Social Agent failed. ${error.message}`;
  }
}
