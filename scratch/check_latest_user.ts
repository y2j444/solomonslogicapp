import { prisma } from "../src/lib/prisma";

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { joinedAt: "desc" },
    take: 1,
  });

  if (users.length === 0) {
    console.log("No users found.");
    return;
  }

  const u = users[0];
  console.log(`User: ${u.email}`);
  console.log(`Business Name: ${u.businessName}`);
  console.log(`AI Phone: ${u.AIPhone}`);
  console.log(`Knowledge Base: ${u.knowledgeBase ? 'Set' : 'Empty'}`);
  console.log(`Call Handling Rules: ${u.callHandlingRules ? 'Set' : 'Empty'}`);
  console.log(`Subscription Status: ${u.subscriptionStatus}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
