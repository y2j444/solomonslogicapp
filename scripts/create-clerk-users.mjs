const clerkSecretKey = process.env.CLERK_SECRET_KEY;

if (!clerkSecretKey) {
  console.error("Missing CLERK_SECRET_KEY in environment.");
  process.exit(1);
}

const users = [
  {
    email_address: ["michael.janico@solomonslogic.com"],
    password: "<TEMP_PASSWORD_1>",
    firstName: "Michael",
    lastName: "Janico",
  },
  {
    email_address: ["mikegjanico@gmail.com"],
    password: "<TEMP_PASSWORD_2>",
    firstName: "Sarah",
    lastName: "Mills",
  },
  {
    email_address: ["owner@peakflowplumbing.com"],
    password: "<TEMP_PASSWORD_3>",
    firstName: "Daniel",
    lastName: "Reed",
  },
];

async function createUser(user) {
  const response = await fetch("https://api.clerk.com/v1/users", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${clerkSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Failed to create ${user.email_address[0]}: ${response.status} ${JSON.stringify(data)}`
    );
  }

  console.log(`Created: ${user.email_address[0]}`);
}

async function main() {
  for (const user of users) {
    try {
      await createUser(user);
    } catch (error) {
      console.error(error.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});