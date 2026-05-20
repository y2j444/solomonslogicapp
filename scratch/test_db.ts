import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Database URL:", process.env.DATABASE_URL);
    console.log("Connecting to database...");
    const userCount = await prisma.user.count();
    console.log("Successfully connected! Total users:", userCount);
  } catch (error) {
    console.error("Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
