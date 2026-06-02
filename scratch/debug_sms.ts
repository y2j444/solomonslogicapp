import dotenv from "dotenv";
dotenv.config();

const KEY = process.env.TELNYX_API_KEY!;
const MSG_ID = "40319e89-5feb-4f42-9542-38dd50ee9089";

async function main() {
  // Check the message status
  const res = await fetch(`https://api.telnyx.com/v2/messages/${MSG_ID}`, {
    headers: {
      Authorization: `Bearer ${KEY}`,
      Accept: "application/json",
    },
  });
  const data = await res.json();
  console.log("Message status:", JSON.stringify(data?.data, null, 2));

  // Also check what messaging profiles exist
  const profileRes = await fetch("https://api.telnyx.com/v2/messaging_profiles", {
    headers: {
      Authorization: `Bearer ${KEY}`,
      Accept: "application/json",
    },
  });
  const profileData = await profileRes.json();
  console.log("\nMessaging profiles:", JSON.stringify(profileData?.data?.map((p: any) => ({ id: p.id, name: p.name, enabled: p.enabled })), null, 2));

  // Check the phone number details
  const numRes = await fetch(`https://api.telnyx.com/v2/phone_numbers?filter[phone_number]=${encodeURIComponent(process.env.TELNYX_PHONE_NUMBER!)}`, {
    headers: {
      Authorization: `Bearer ${KEY}`,
      Accept: "application/json",
    },
  });
  const numData = await numRes.json();
  console.log("\nPhone number details:", JSON.stringify(numData?.data?.[0], null, 2));
}

main();
