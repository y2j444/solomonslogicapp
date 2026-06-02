import dotenv from "dotenv";
dotenv.config();

const TELNYX_API_BASE = "https://api.telnyx.com/v2";

async function sendTestSms() {
  const from = process.env.TELNYX_PHONE_NUMBER;
  const key = process.env.TELNYX_API_KEY;

  if (!from || !key) {
    console.error("Missing TELNYX_PHONE_NUMBER or TELNYX_API_KEY");
    process.exit(1);
  }

  const to = "+17169394226";
  const text =
    "Hey Mike! 👋 This is Sara, your AI receptionist from Solomon's Logic. Just confirming your SMS line is working perfectly. Ready to start capturing leads! 🚀";

  console.log(`Sending SMS from ${from} to ${to}...`);

  const res = await fetch(`${TELNYX_API_BASE}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ from, to, text }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("❌ Failed:", JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log("✅ SMS sent successfully!");
  console.log("Message ID:", data?.data?.id);
  console.log("Status:", data?.data?.to?.[0]?.status);
}

sendTestSms();
