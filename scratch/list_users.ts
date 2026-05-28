import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log("--- All Users in Database ---");
    users.forEach(u => {
      console.log(`ID: ${u.id} | Email: ${u.email} | Business: ${u.businessName} | Phone: ${u.AIPhone}`);
    });
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
