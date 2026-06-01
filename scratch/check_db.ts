import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  console.log('--- Latest Call Logs ---');
  const logs = await prisma.callLog.findMany({
    take: 5,
    orderBy: { calledAt: 'desc' },
  });
  console.log(logs);

  console.log('--- User Info ---');
  const users = await prisma.user.findMany({
    take: 2,
  });
  console.log(users);
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
