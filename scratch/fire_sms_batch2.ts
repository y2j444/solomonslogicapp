import dotenv from "dotenv";
dotenv.config();

const TELNYX_API_BASE = "https://api.telnyx.com/v2";
const FROM = process.env.TELNYX_PHONE_NUMBER!;
const KEY = process.env.TELNYX_API_KEY!;

const smsLeads = [
  { business: "Interstate AC", phone: "+16158022665", industry: "HVAC" },
  { business: "The Arcticom Group Nashville", phone: "+16152550604", industry: "HVAC" },
  { business: "615 Plumbing", phone: "+16156390298", industry: "Plumbing" },
  { business: "Jack Ward & Sons Plumbing Co.", phone: "+16152272811", industry: "Plumbing" },
  { business: "TN Plumbing Solutions", phone: "+16158871501", industry: "Plumbing" },
  { business: "Elevate Medical Spa", phone: "+16154256340", industry: "MedSpa" },
  { business: "LaserDerm Medspa", phone: "+16154652219", industry: "MedSpa" },
  { business: "Master's Landscape Design", phone: "+16152882052", industry: "Landscaping" },
  { business: "Terra Landscape Company", phone: "+16156501737", industry: "Landscaping" },
  { business: "Park View Lawn Care & Landscaping", phone: "+16152609051", industry: "Landscaping" },
  { business: "Cornerstone Landscape Management", phone: "+16153529551", industry: "Landscaping" },
];

function buildMessage(business: string, industry: string): string {
  const openers: Record<string, string> = {
    HVAC: "Missing calls after hours costs HVAC businesses thousands every month.",
    Plumbing: "Every missed call is a leaking pipe job going to your competitor.",
    MedSpa: "Your clients expect a premium experience — even when you're fully booked.",
    Landscaping: "Spring is your busiest season — don't lose jobs to voicemail.",
  };
  const opener = openers[industry] ?? "Every missed call is a missed opportunity.";
  return `Hi ${business}! 👋 ${opener}

Solomon's Logic built Sara — an AI receptionist that answers every call 24/7, books appointments, and texts leads back automatically.

$149/mo. No contracts. Try it free: app.solomonslogic.com

Reply STOP to opt out.`;
}

async function sendSms(to: string, text: string): Promise<boolean> {
  const res = await fetch(`${TELNYX_API_BASE}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ from: FROM, to, text }),
  });
  return res.ok;
}

async function main() {
  console.log(`🚀 Firing SMS outreach to ${smsLeads.length} untouched leads...\n`);
  const results: { business: string; status: string }[] = [];

  for (const lead of smsLeads) {
    const msg = buildMessage(lead.business, lead.industry);
    const ok = await sendSms(lead.phone, msg);
    const status = ok ? "✅ sent" : "❌ failed";
    console.log(`${status} → ${lead.business} (${lead.phone})`);
    results.push({ business: lead.business, status });
    // Small delay to avoid rate limits
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n📊 Results: ${results.filter((r) => r.status.includes("✅")).length}/${results.length} sent`);
}

main();
