import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function main() {
  const email = "solomonslogicdemo1@gmail.com";
  const apiKey = process.env.CLERK_SECRET_KEY;

  if (!apiKey) {
    console.error("Missing CLERK_SECRET_KEY");
    return;
  }

  console.log(`Looking up Clerk user by email: ${email}`);
  
  const res = await fetch(`https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`, {
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    }
  });

  const users = await res.json();

  if (!users || users.length === 0) {
    console.log("No Clerk user found with that email.");
    return;
  }

  const user = users[0];
  console.log(`Deleting Clerk user: ${user.id}`);
  
  const delRes = await fetch(`https://api.clerk.com/v1/users/${user.id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    }
  });

  if (delRes.ok) {
    console.log("Successfully deleted user from Clerk!");
  } else {
    console.log("Failed to delete", await delRes.text());
  }
}

main().catch(console.error);
