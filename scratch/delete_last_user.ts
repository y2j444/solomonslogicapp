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

  const latestUser = users[0];
  console.log(`Deleting user: ${latestUser.email} (ID: ${latestUser.id})`);

  await prisma.user.delete({
    where: { id: latestUser.id },
  });

  console.log("User deleted successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
