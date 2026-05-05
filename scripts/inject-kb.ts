import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { joinedAt: 'desc' },
    take: 1
  });

  if (users.length > 0) {
    const user = users[0];
    await prisma.user.update({
      where: { id: user.id },
      data: {
        knowledgeBase: 'We are a dental office located on Main Street. We offer teeth cleaning, whitening, and general dentistry. Our hours are Monday to Friday, 9am to 5pm.',
        callHandlingRules: 'Always be polite. Ask for the callers name and what service they are interested in. If it is a medical emergency, tell them to call 911.'
      }
    });
    console.log('Successfully updated knowledge base for user:', user.email);
  } else {
    console.log('No users found.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
