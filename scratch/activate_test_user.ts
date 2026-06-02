import { prisma } from "../src/lib/prisma";
import { provisionNumberForUser } from "../src/lib/telnyx";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { joinedAt: "desc" },
    take: 1,
  });

  if (users.length === 0) return;
  const user = users[0];

  console.log(`Activating user: ${user.email}`);

  // Provision a real number
  const number = await provisionNumberForUser("615");
  
  if (!number) {
    console.error("Failed to provision number");
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: "active",
      AIPhone: number,
      knowledgeBase: `Business: ${user.businessName}
Hours: Mon-Fri 8am-6pm.
Services: General contracting and consulting.
Emergency: We offer 24/7 emergency service.
Pricing: Free estimates.`,
      callHandlingRules: `- Always try to book an appointment.
- Collect name, phone, and reason for calling.
- Be extremely polite and professional.`,
    },
  });

  console.log(`User activated! Phone: ${number}`);
}

main().catch(console.error);
