import dotenv from "dotenv";
dotenv.config();

const KEY = process.env.TELNYX_API_KEY!;

async function main() {
  // Check 10DLC brands
  const brandRes = await fetch("https://api.telnyx.com/v2/brand", {
    headers: { Authorization: `Bearer ${KEY}`, Accept: "application/json" },
  });
  const brandData = await brandRes.json();
  console.log("Brands:", JSON.stringify(brandData, null, 2));

  // Check 10DLC campaigns
  const campRes = await fetch("https://api.telnyx.com/v2/campaign", {
    headers: { Authorization: `Bearer ${KEY}`, Accept: "application/json" },
  });
  const campData = await campRes.json();
  console.log("\nCampaigns:", JSON.stringify(campData, null, 2));

  // Check messaging profile settings (webhook etc)
  const profRes = await fetch("https://api.telnyx.com/v2/messaging_profiles/40019e6f-b702-4f94-9fc6-8ee539de1a67", {
    headers: { Authorization: `Bearer ${KEY}`, Accept: "application/json" },
  });
  const profData = await profRes.json();
  console.log("\nMessaging profile detail:", JSON.stringify(profData?.data, null, 2));
}

main();
