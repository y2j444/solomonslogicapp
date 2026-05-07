import { OpenAI } from "openai";
import { prisma } from "../src/lib/prisma";

export async function outreachAgent(task: string) {
  const openai = new OpenAI();
  console.log("[Outreach] Analyzing market for leads...");

  // In a production scenario, we'd use a Search Tool here.
  // For now, we'll simulate the "finding" process and generate high-quality leads.
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { 
        role: "system", 
        content: `You are the Sales & Marketing Agent for Solomon's Logic. 
        Your goal is to identify potential businesses in the Middle Tennessee area (Franklin, Nashville, Brentwood) that need AI Receptionist services.
        Generate 3 realistic business leads that would benefit from an AI receptionist (e.g., busy law firms, dental clinics, HVAC companies).
        Format the output as a JSON array of objects with: businessName, contactName, phone, and whyTheyNeedIt.` 
      },
      { role: "user", content: task }
    ],
    response_format: { type: "json_object" }
  });

  const content = response.choices[0].message.content;
  if (!content) return;

  const { leads } = JSON.parse(content);

  // Get the first user to assign leads to (as the owner)
  const user = await prisma.user.findFirst();
  if (!user) {
    return "Error: No user found in database to assign leads to.";
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
}
