/**
 * Blasts pitch emails to all leads with status "scraped" in reports/scraped_leads.json
 * Run: npx tsx scratch/blast_all_leads.ts
 */
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const LEADS_FILE = path.join(process.cwd(), 'reports', 'scraped_leads.json');

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.error('❌ Missing GMAIL_USER or GMAIL_APP_PASSWORD in .env');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
});

type Lead = {
  business: string;
  industry: string;
  email: string;
  phone?: string;
  website?: string;
  status: string;
  sentAt?: string;
};

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

async function main() {
  const leads: Lead[] = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
  const targets = leads.filter(l => l.status === 'scraped');

  console.log(`\n📧 Solomon's Logic — Lead Blast`);
  console.log(`📤 Sending from: ${GMAIL_USER}`);
  console.log(`🎯 Targets: ${targets.length} unsent leads\n`);

  for (const lead of targets) {
    const { subject, html } = buildEmail(lead);
    try {
      const info = await transporter.sendMail({
        from: `Mike Janico <${GMAIL_USER}>`,
        to: lead.email,
        subject,
        html,
      });
      console.log(`✅ ${lead.business} (${lead.email}) — ${info.messageId}`);
      // Update status in file
      const updated = leads.map(l =>
        l.email === lead.email ? { ...l, status: 'sent', sentAt: new Date().toISOString() } : l
      );
      fs.writeFileSync(LEADS_FILE, JSON.stringify(updated, null, 2));
    } catch (err: any) {
      console.error(`❌ Failed → ${lead.business} (${lead.email}): ${err?.message}`);
    }
    // Throttle: wait 2s between sends to avoid spam filters
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n✅ Blast complete!\n');
}

main();
