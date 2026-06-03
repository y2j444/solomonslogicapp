import { socialAgent } from "../agency/social.js";
import { ghostPost } from "../agency/ghost_poster.js";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("Generating social media content...");
  const task = "Announce our new AI Receptionist service, Sara. We just lowered the price to $199/month with the first month free. She answers calls instantly, sounds human, and books appointments 24/7. Mention our demo number (615) 716-3328. Target local home service businesses in Nashville.";
  
  const report = await socialAgent(task);
  console.log(report);
  
  // Extract posts (simple parsing for the automation script)
  const linkedInMatch = report.match(/--- LinkedIn Post ---\n([\s\S]*?)\n\n--- Facebook Post ---/);
  const facebookMatch = report.match(/--- Facebook Post ---\n([\s\S]*?)\n\n--- Google Business Profile Post ---/);
  
  const linkedinContent = linkedInMatch ? linkedInMatch[1].trim() : "";
  const facebookContent = facebookMatch ? facebookMatch[1].trim() : "";

  if (linkedinContent) {
    console.log("\nPosting to LinkedIn...");
    const res = await ghostPost("linkedin", linkedinContent);
    console.log(res);
  }

  if (facebookContent) {
    console.log("\nPosting to Facebook...");
    const res = await ghostPost("facebook", facebookContent);
    console.log(res);
  }
}

main().catch(console.error);
