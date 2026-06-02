/**
 * SOLOMON'S LOGIC — FULL OUTBOUND CAMPAIGN
 * Deploys: Email + SMS + AI Call to all leads
 * 
 * Run: npx tsx scratch/deploy_campaign.ts
 */

import * as dotenv from "dotenv";
import * as nodemailer from "nodemailer";
import Telnyx from "telnyx";
import { AgentDispatchClient } from "livekit-server-sdk";
import { OpenAI } from "openai";
import fs from "fs";
import path from "path";

dotenv.config();

const GMAIL_USER = process.env.GMAIL_USER!;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD!;
const TELNYX_API_KEY = process.env.TELNYX_API_KEY!;
const TELNYX_FROM = process.env.TELNYX_PHONE_NUMBER || "+16157163328";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const LK_URL = process.env.LIVEKIT_URL!;
const LK_KEY = process.env.LIVEKIT_API_KEY!;
const LK_SECRET = process.env.LIVEKIT_API_SECRET!;

const LEADS_FILE = path.join(process.cwd(), "reports", "scraped_leads.json");

type Lead = {
  business: string;
  industry: string;
  email: string;
  phone?: string;
  website?: string;
  status: string;
  sentAt?: string;
  smsSentAt?: string;
  calledAt?: string;
};

// ───────────────────────── EMAIL ─────────────────────────

function buildEmail(lead: Lead) {
  const subject = `Quick question about missed calls at ${lead.business}`;
  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
    <p>Hi there,</p>
    <p>My name is Mike — I'm a developer based here in Nashville.</p>
    <p>I built an AI phone receptionist called <strong>Sara</strong> specifically for ${lead.industry} businesses. She answers your phone when you're on a job, sounds completely human, and books appointments directly into your calendar — 24/7, including nights and weekends.</p>
    <p><strong>You can hear her right now</strong> — just call <a href="tel:+16157163328" style="color: #355cc9;">(615) 716-3328</a> and ask to book something. Takes 60 seconds. I think you'll be genuinely surprised.</p>
    <p>For ${lead.business}, this means:</p>
    <ul>
      <li>✅ Every emergency call gets answered — even at 2 AM</li>
      <li>✅ No more lost jobs to voicemail</li>
      <li>✅ Appointments booked automatically into your schedule</li>
      <li>✅ Setup takes 3 minutes — just forward your calls</li>
    </ul>
    <p>You can <strong>try it for a month completely free</strong>. After that, it's $199/month — less than one lost job per month likely costs you. No contracts, cancel anytime.</p>
    <p>If you're interested, get started at <a href="https://app.solomonslogic.com" style="color: #355cc9;">app.solomonslogic.com</a> or just reply to this email and I'll personally walk you through it.</p>
    <p>Thanks,<br>
    <strong>Mike Janico</strong><br>
    Founder, Solomon's Logic<br>
    <a href="tel:+16157163328" style="color: #355cc9;">(615) 716-3328</a><br>
    <a href="https://solomonslogic.com" style="color: #355cc9;">solomonslogic.com</a></p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
    <p style="font-size: 12px; color: #999;">You're receiving this because you run a local Nashville business. Reply STOP and I'll remove you immediately.</p>
  </div>`;
  return { subject, html };
}

async function sendEmails(leads: Lead[]) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });

  const targets = leads.filter((l) => l.status === "scraped");
  console.log(`\n📧 EMAIL BLAST — ${targets.length} unsent leads`);

  let sent = 0;
  for (const lead of targets) {
    const { subject, html } = buildEmail(lead);
    try {
      await transporter.sendMail({
        from: `Mike Janico <${GMAIL_USER}>`,
        to: lead.email,
        subject,
        html,
      });
      lead.status = "sent";
      lead.sentAt = new Date().toISOString();
      sent++;
      console.log(`  ✅ ${lead.business} → ${lead.email}`);
    } catch (err: any) {
      console.error(`  ❌ ${lead.business}: ${err?.message}`);
    }
    await new Promise((r) => setTimeout(r, 2000)); // throttle
  }
  console.log(`📧 Emails sent: ${sent}/${targets.length}`);
  return sent;
}

// ───────────────────────── SMS ─────────────────────────

async function generateSMSPitch(lead: Lead): Promise<string> {
  const fallback = `Hi! This is Mike from Solomon's Logic. We built an AI receptionist for ${lead.industry} businesses — she answers calls 24/7, sounds completely human, and books jobs into your calendar. You can try her right now: call (615) 716-3328. First month free, $199/mo after. No contracts. Reply STOP to opt out.`;

  if (!OPENAI_API_KEY) return fallback;

  try {
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an elite cold SMS copywriter. Write extremely concise, conversational, high-converting cold pitches. No hashtags. Under 160 words. Sound like a helpful local entrepreneur, not a marketer.",
        },
        {
          role: "user",
          content: `Write a cold SMS pitch to ${lead.business} (${lead.industry} in Nashville). We have an AI receptionist named Sara that answers calls 24/7, books appointments, and costs $199/mo. Demo line: (615) 716-3328. First month free. Include STOP opt-out.`,
        },
      ],
      temperature: 0.7,
    });
    return resp.choices[0]?.message?.content?.trim() || fallback;
  } catch {
    return fallback;
  }
}

async function sendSMS(leads: Lead[]) {
  const telnyx = new (Telnyx as any)(TELNYX_API_KEY);
  const targets = leads.filter((l) => l.phone && !l.smsSentAt);
  console.log(`\n💬 SMS BLAST — ${targets.length} leads with phone numbers`);

  let sent = 0;
  for (const lead of targets) {
    const pitch = await generateSMSPitch(lead);
    try {
      await telnyx.messages.send({
        text: pitch,
        from: TELNYX_FROM,
        to: lead.phone,
      });
      lead.smsSentAt = new Date().toISOString();
      sent++;
      console.log(`  ✅ ${lead.business} → ${lead.phone}`);
    } catch (err: any) {
      console.error(`  ❌ ${lead.business}: ${err?.message}`);
    }
    await new Promise((r) => setTimeout(r, 3000)); // throttle
  }
  console.log(`💬 SMS sent: ${sent}/${targets.length}`);
  return sent;
}

// ───────────────────────── AI CALLS ─────────────────────────

async function deployAICalls(leads: Lead[]) {
  const dispatchClient = new AgentDispatchClient(LK_URL, LK_KEY, LK_SECRET);
  const targets = leads.filter((l) => l.phone && !l.calledAt);
  console.log(`\n📞 AI CALL CAMPAIGN — ${targets.length} leads with phone numbers`);

  let dispatched = 0;
  for (const lead of targets) {
    const roomName = `outbound-${Date.now()}-${dispatched}`;
    try {
      await dispatchClient.createDispatch(roomName, "sales-pitcher", {
        metadata: JSON.stringify({
          phone: lead.phone,
          name: lead.business,
          leadName: "there", // generic since we don't know owner name
        }),
      });
      lead.calledAt = new Date().toISOString();
      dispatched++;
      console.log(`  📲 ${lead.business} → ${lead.phone} (room: ${roomName})`);
    } catch (err: any) {
      console.error(`  ❌ ${lead.business}: ${err?.message}`);
    }
    // Space calls 30 seconds apart so Marcus isn't overwhelmed
    if (dispatched < targets.length) {
      console.log(`  ⏳ Waiting 30s before next call...`);
      await new Promise((r) => setTimeout(r, 30000));
    }
  }
  console.log(`📞 AI calls dispatched: ${dispatched}/${targets.length}`);
  return dispatched;
}

// ───────────────────────── MAIN ─────────────────────────

async function main() {
  console.log("\n" + "═".repeat(60));
  console.log("  SOLOMON'S LOGIC — FULL OUTBOUND CAMPAIGN DEPLOYMENT");
  console.log("  \"Every missed call is a missed paycheck.\"");
  console.log("═".repeat(60));

  const leads: Lead[] = JSON.parse(fs.readFileSync(LEADS_FILE, "utf-8"));
  const withPhone = leads.filter((l) => l.phone);
  const withEmail = leads.filter((l) => l.email);
  const unsent = leads.filter((l) => l.status === "scraped");

  console.log(`\n📊 CAMPAIGN INTELLIGENCE:`);
  console.log(`   Total leads: ${leads.length}`);
  console.log(`   With email: ${withEmail.length}`);
  console.log(`   With phone: ${withPhone.length}`);
  console.log(`   Unsent emails: ${unsent.length}`);
  console.log(`   Needs SMS: ${withPhone.filter((l) => !l.smsSentAt).length}`);
  console.log(`   Needs AI call: ${withPhone.filter((l) => !l.calledAt).length}`);

  // ── PHASE 1: Emails ──
  console.log("\n" + "─".repeat(60));
  console.log("  PHASE 1: EMAIL OUTREACH");
  console.log("─".repeat(60));
  const emailsSent = await sendEmails(leads);
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));

  // ── PHASE 2: SMS ──
  console.log("\n" + "─".repeat(60));
  console.log("  PHASE 2: SMS PITCH BLAST");
  console.log("─".repeat(60));
  const smsSent = await sendSMS(leads);
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));

  // ── PHASE 3: AI Calls ──
  console.log("\n" + "─".repeat(60));
  console.log("  PHASE 3: AI COLD CALLS (Marcus)");
  console.log("─".repeat(60));
  const callsMade = await deployAICalls(leads);
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));

  // ── RESULTS ──
  console.log("\n" + "═".repeat(60));
  console.log("  CAMPAIGN DEPLOYMENT COMPLETE");
  console.log("═".repeat(60));
  console.log(`  📧 Emails sent: ${emailsSent}`);
  console.log(`  💬 SMS sent: ${smsSent}`);
  console.log(`  📞 AI calls dispatched: ${callsMade}`);
  console.log(`\n  💰 Total touchpoints: ${emailsSent + smsSent + callsMade}`);
  console.log("═".repeat(60) + "\n");
}

main().catch((e) => {
  console.error("Campaign failed:", e);
  process.exit(1);
});
