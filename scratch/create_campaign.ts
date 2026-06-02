import dotenv from "dotenv";
dotenv.config();

const KEY = process.env.TELNYX_API_KEY!;
const BRAND_ID = "4b20019e-897b-6c68-7dea-e8509d086847"; // Solomons Logic brand
const MESSAGING_PROFILE_ID = "40019e6f-b702-4f94-9fc6-8ee539de1a67"; // Sales Outreach profile

async function createCampaign() {
  console.log("Creating 10DLC campaign via API...\n");

  const res = await fetch("https://api.telnyx.com/v2/campaign", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      brandId: BRAND_ID,
      usecase: "MIXED",
      description:
        "We send appointment reminders, lead follow-ups, and promotional messages to small business owners who have inquired about our AI receptionist service.",
      embeddedLink: true,
      embeddedPhone: false,
      numberPool: false,
      ageGated: false,
      directLending: false,
      subscriberOptin: true,
      subscriberOptout: true,
      subscriberHelp: true,
      sample1:
        "Hi! This is Sara from Solomon's Logic. You have an appointment confirmed for [date]. Reply STOP to opt out.",
      sample2:
        "Hi [Name]! We wanted to follow up on your interest in our AI receptionist. Visit app.solomonslogic.com. Reply STOP to opt out.",
      messageFlow:
        "Customers opt in by signing up at app.solomonslogic.com",
      helpMessage:
        "Solomon's Logic: Please reach out to us at app.solomonslogic.com or solomonslogic@gmail.com for help.",
      optinKeywords: "START,YES",
      optoutKeywords: "STOP,UNSUBSCRIBE",
      helpKeywords: "HELP",
      optinMessage:
        "Solomon's Logic: Thanks for subscribing! Reply HELP for help. Msg & data rates may apply. Consent is not a condition of purchase. Reply STOP to opt out.",
      optoutMessage:
        "Solomon's Logic: You are unsubscribed and will receive no further messages.",
      privacyPolicyLink: "https://app.solomonslogic.com/privacy",
      termsAndConditionsLink: "https://app.solomonslogic.com/terms",
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("❌ Campaign creation failed:");
    console.error(JSON.stringify(data, null, 2));
    return;
  }

  const campaignId = data?.data?.campaignId ?? data?.data?.id;
  console.log("✅ Campaign created!");
  console.log("Campaign ID:", campaignId);
  console.log("Status:", data?.data?.status);
  console.log("Use case:", data?.data?.usecase);
  console.log("\nFull response:", JSON.stringify(data?.data, null, 2));

  // Now link campaign to messaging profile
  if (campaignId) {
    console.log("\nLinking campaign to messaging profile...");
    const linkRes = await fetch(
      `https://api.telnyx.com/v2/messaging_profiles/${MESSAGING_PROFILE_ID}/campaign_assignments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ campaign_id: campaignId }),
      }
    );
    const linkData = await linkRes.json();
    if (linkRes.ok) {
      console.log("✅ Campaign linked to messaging profile!");
    } else {
      console.log("⚠️ Link step:", JSON.stringify(linkData, null, 2));
    }
  }
}

createCampaign();
