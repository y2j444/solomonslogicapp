import { prisma } from "../src/lib/prisma";

export async function reviewAgent(task: string) {
  console.log("[Reviews] Preparing review request campaign...");

  // Get the most recent contact who doesn't have a review request yet (simplified logic)
  const contact = await prisma.contact.findFirst({
    where: {
      status: { not: "Review Requested" }
    },
    orderBy: { createdAt: "desc" }
  });

  if (!contact) {
    return "[Reviews] No new contacts found to request reviews from. Go find some more leads!";
  }

  const reviewLink = "https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID_HERE";
  
  const emailTemplate = `
Subject: How did we do, ${contact.fullName.split(' ')[0]}?

Hi ${contact.fullName.split(' ')[0]},

It was a pleasure helping ${contact.company || "your business"} with your AI automation needs! 

We are a small local business in Franklin, and your feedback means the world to us. Would you mind taking 30 seconds to share your experience on Google? It helps other local businesses find us.

Leave a review here: ${reviewLink}

Thank you for your support!
- Mike, Solomon's Logic
  `.trim();

  // Update contact status
  await prisma.contact.update({
    where: { id: contact.id },
    data: { notes: (contact.notes || "") + "\n[System] Review requested on " + new Date().toLocaleDateString() }
  });

  return `
[Reviews] Review request ready for ${contact.fullName} (${contact.company}).

--- EMAIL DRAFT ---
${emailTemplate}

[Action] Copy this into your email and send it over! (Don't forget to replace YOUR_PLACE_ID_HERE in the link).
  `.trim();
}
