import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.$queryRaw`SELECT email, "joinedAt" FROM "User" ORDER BY "joinedAt" DESC LIMIT 5`;
  const countRaw: any = await prisma.$queryRaw`SELECT count(*) FROM "User"`;
  
  console.log('Total Users:', countRaw[0].count.toString());
  console.log('Recent Users:', JSON.stringify(users, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
