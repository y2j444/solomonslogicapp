/**
 * Solomon's Logic — Cold Email Engine
 *
 * Sends personalized cold emails to Nashville business owners using Gmail SMTP.
 *
 * SETUP REQUIRED (one time):
 * 1. Go to https://myaccount.google.com/apppasswords
 * 2. Generate an App Password for "Mail"
 * 3. Add to .env: GMAIL_USER=your@gmail.com and GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
 *
 * Run: npx tsx scratch/cold_email.ts
 */

import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.error(`
❌ Missing Gmail credentials. Add to .env:

  GMAIL_USER=michael.janico@gmail.com
  GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

  To generate an App Password:
  1. Go to: https://myaccount.google.com/apppasswords
  2. Select app: "Mail", device: "Other" → name it "Outreach"
  3. Copy the 16-character password and paste above.
`);
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

type Lead = {
  to: string;
  business: string;
  ownerName?: string;
  industry: string;
};

// Real emails collected from the businesses we already tried to SMS
const leads: Lead[] = [
  {
    to: 'customerservice@themaynardman.com',
    business: 'Maynard Plumbing, Heating & Cooling',
    industry: 'HVAC & Plumbing',
  },
  {
    to: 'jamie@abcoroofingtn.com',
    business: 'ABCO Roofing',
    ownerName: 'Jamie',
    industry: 'Roofing',
  },
  {
    to: 'contact@donkennedyroofing.com',
    business: 'Don Kennedy Roofing',
    industry: 'Roofing',
  },
];

function buildEmail(lead: Lead): { subject: string; html: string } {
  const greeting = lead.ownerName ? `Hi ${lead.ownerName},` : 'Hi there,';
  const subject = `Quick question about missed calls at ${lead.business}`;

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
    <p>${greeting}</p>

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

    <p>It's <strong>$199/month</strong> — less than one lost job per month likely costs you. No contracts, cancel anytime.</p>

    <p>If you're interested, you can get started at <a href="https://app.solomonslogic.com" style="color: #355cc9;">app.solomonslogic.com</a> or just reply to this email and I'll personally walk you through it.</p>

    <p>Thanks for your time,<br>
    <strong>Mike Janico</strong><br>
    Founder, Solomon's Logic<br>
    <a href="tel:+16157163328" style="color: #355cc9;">(615) 716-3328</a><br>
    <a href="https://solomonslogic.com" style="color: #355cc9;">solomonslogic.com</a></p>

    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
    <p style="font-size: 12px; color: #999;">You're receiving this because you run a local Nashville business. Reply STOP and I'll remove you immediately.</p>
  </div>
  `;

  return { subject, html };
}

async function sendAll() {
  console.log('\n📧 Solomon\'s Logic — Cold Email Engine');
  console.log(`📤 Sending from: ${GMAIL_USER}\n`);

  for (const lead of leads) {
    const { subject, html } = buildEmail(lead);
    try {
      const info = await transporter.sendMail({
        from: `Mike Janico <${GMAIL_USER}>`,
        to: lead.to,
        subject,
        html,
      });
      console.log(`✅ Sent to ${lead.business} (${lead.to}) — ID: ${info.messageId}`);
    } catch (err: any) {
      console.error(`❌ Failed → ${lead.business} (${lead.to}):`, err?.message);
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n✅ Email campaign complete.\n');
}

sendAll();
