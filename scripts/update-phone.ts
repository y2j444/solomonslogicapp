import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.user.updateMany({
    where: { email: "michael.janico@solomonslogic.com" },
    data: { twilioPhone: "+18556744026" },
  });
  console.log("Updated rows:", updated.count);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
