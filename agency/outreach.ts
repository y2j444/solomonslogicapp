import { OpenAI } from "openai";
import { prisma } from "../src/lib/prisma";

export async function outreachAgent(task: string) {
  try {
    const openai = new OpenAI();
    console.log("[Outreach] Analyzing market for leads...");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are the Sales & Marketing Agent for Solomon's Logic. 
          Your goal is to identify potential businesses in the Middle Tennessee area (Franklin, Nashville, Brentwood) that need AI Receptionist services.
          Generate 3 realistic business leads that would benefit from an AI receptionist.
          IMPORTANT: You MUST return a JSON object with a single property 'leads' which is an array of objects. 
          Each object must have: businessName, contactName, phone, and whyTheyNeedIt.` 
        },
        { role: "user", content: task }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) return "Error: Agent failed to generate content.";

    const parsed = JSON.parse(content);
    const leads = parsed.leads || [];

    if (leads.length === 0) {
      return "The agent couldn't find any specific leads for that request. Try being more specific about the location or industry.";
    }

    // Get the first user to assign leads to (as the owner)
    const user = await prisma.user.findFirst();
    if (!user) {
      console.error("[Outreach] Error: No user found in database.");
      return "Error: No user found in database to assign leads to. Please ensure you have signed up.";
    }

    let summary = `[Outreach] Found ${leads.length} potential leads. Leads saved to database:\n`;
    for (const lead of leads) {
      // Create or find contact
      const contact = await prisma.contact.create({
        data: {
          fullName: lead.contactName,
          company: lead.businessName,
          phone: lead.phone,
          ownerUserId: user.id,
          notes: lead.whyTheyNeedIt,
          status: "Prospect"
        }
      });

      // Create lead entry
      await prisma.lead.create({
        data: {
          leadTitle: `AI Receptionist for ${lead.businessName}`,
          contactId: contact.id,
          ownerUserId: user.id,
          source: "AI Outreach Agent",
          notes: `Reason: ${lead.whyTheyNeedIt}`,
          stage: "New"
        }
      });

      summary += `- ${lead.businessName} (${lead.contactName})\n`;
      console.log(`[Outreach] + Added Lead: ${lead.businessName} (${lead.contactName})`);
    }

    return summary + "\n[Outreach] Task complete. Leads are now in your CRM.";
  } catch (error: any) {
    console.error("[Outreach] Fatal Error:", error);
    return `Error: Outreach Agent failed. ${error.message}`;
  }
}
