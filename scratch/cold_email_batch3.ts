/**
 * Solomon's Logic — Cold Email Batch 3
 * Targeting all remaining scraped leads with email addresses that haven't been contacted yet.
 * Run: npx tsx scratch/cold_email_batch3.ts
 */

import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.error('❌ Missing GMAIL_USER or GMAIL_APP_PASSWORD in .env');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
});

type Lead = {
  to: string;
  business: string;
  ownerName?: string;
  industry: string;
};

const leads: Lead[] = [
  // HVAC
  { to: 'info@interstateac.com', business: 'Interstate AC', industry: 'HVAC' },
  { to: 'nashville@arcticomgroup.com', business: 'The Arcticom Group Nashville', industry: 'HVAC' },
  // Plumbing
  { to: 'officecsr@615plumbing.com', business: '615 Plumbing', industry: 'Plumbing' },
  { to: 'maclain@wardp-m.com', business: 'Jack Ward & Sons Plumbing Co.', ownerName: 'Maclain', industry: 'Plumbing' },
  { to: 'plumbingsolutions92@yahoo.com', business: 'TN Plumbing Solutions', industry: 'Plumbing' },
  // Roofing
  { to: 'nashville@aarcroofing.com', business: 'Above All Roofing Nashville', industry: 'Roofing' },
  { to: 'randy@cccroofing.com', business: 'CCC Roofing', ownerName: 'Randy', industry: 'Roofing' },
  { to: 'info@eliteroofingofnashville.com', business: 'Elite Roofing Company of Nashville', industry: 'Roofing' },
  { to: 'info@5prc.com', business: 'Five Points Roofing', industry: 'Roofing' },
  { to: 'roofing@heparmer.com', business: 'H.E. Parmer Company', industry: 'Roofing' },
  // MedSpa
  { to: 'info@elevatemedispa.com', business: 'Elevate Medical Spa', industry: 'Medical Spa' },
  { to: 'info@laserdermmedspa.com', business: 'LaserDerm Medspa', industry: 'Medical Spa' },
  // Landscaping
  { to: 'info@masterslandscapedesign.com', business: "Master's Landscape Design", industry: 'Landscaping' },
  { to: 'info@terralandscapellc.com', business: 'Terra Landscape Company', industry: 'Landscaping' },
  { to: 'service@parkviewlawncare.com', business: 'Park View Lawn Care & Landscaping', industry: 'Landscaping' },
  { to: 'cornerstonelandscapemanagement@yahoo.com', business: 'Cornerstone Landscape Management', industry: 'Landscaping' },
  { to: 'admin@opportunitylandscapesandnursery.com', business: 'Opportunity Landscapes and Nursery', industry: 'Landscaping' },
];

const industryHooks: Record<string, string> = {
  HVAC: 'When your tech is on a job and a new customer calls about a broken AC in July heat — they don\'t leave a voicemail. They call your competitor.',
  Plumbing: 'Every missed call is a burst pipe job or a bathroom remodel going to someone else.',
  Roofing: 'Storm season is here. Homeowners calling for estimates don\'t wait — they go with whoever picks up first.',
  'Medical Spa': 'Your clients expect a premium, seamless experience — even when your front desk is fully booked.',
  Landscaping: 'Spring bookings fill up fast. Every missed call is a full-season lawn care client walking away.',
};

function buildEmail(lead: Lead): { subject: string; html: string } {
  const greeting = lead.ownerName ? `Hi ${lead.ownerName},` : 'Hi there,';
  const hook = industryHooks[lead.industry] ?? 'Every missed call is a missed opportunity.';
  const subject = `Quick question about missed calls at ${lead.business}`;

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
    <p>${greeting}</p>

    <p>My name is Mike — I'm a developer based here in Nashville.</p>

    <p>${hook}</p>

    <p>I built an AI phone receptionist called <strong>Sara</strong> specifically for ${lead.industry} businesses. She answers every call when you're unavailable, sounds completely human, and can book appointments directly into your calendar — 24/7, including nights and weekends.</p>

    <p><strong>You can hear her right now</strong> — call <a href="tel:+16157163328" style="color: #355cc9;">(615) 716-3328</a> and ask to book something. Takes 60 seconds. I think you'll be genuinely impressed.</p>

    <p>For ${lead.business}, this means:</p>
    <ul>
      <li>✅ Every call gets answered — even at 2 AM</li>
      <li>✅ No more lost jobs to voicemail</li>
      <li>✅ Appointments booked automatically into your schedule</li>
      <li>✅ Setup takes 3 minutes — just forward your calls</li>
    </ul>

    <p><strong>Try it free for a month.</strong> After that, it's $149/month — less than one lost job. No contracts, cancel anytime.</p>

    <p>Get started at <a href="https://app.solomonslogic.com" style="color: #355cc9;">app.solomonslogic.com</a> or just reply here and I'll walk you through it personally.</p>

    <p>Thanks for your time,<br>
    <strong>Mike Janico</strong><br>
    Founder, Solomon's Logic<br>
    <a href="tel:+16157163328" style="color: #355cc9;">(615) 716-3328</a><br>
    <a href="https://app.solomonslogic.com" style="color: #355cc9;">app.solomonslogic.com</a></p>

    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
    <p style="font-size: 12px; color: #999;">You're receiving this because you run a local Nashville business. Reply STOP and I'll remove you immediately.</p>
  </div>
  `;

  return { subject, html };
}

async function sendAll() {
  console.log('\n📧 Solomon\'s Logic — Cold Email Batch 3');
  console.log(`📤 Sending from: ${GMAIL_USER}`);
  console.log(`📋 Targets: ${leads.length} businesses\n`);

  let sent = 0;
  let failed = 0;

  for (const lead of leads) {
    const { subject, html } = buildEmail(lead);
    try {
      await transporter.sendMail({
        from: `Mike Janico <${GMAIL_USER}>`,
        to: lead.to,
        subject,
        html,
      });
      console.log(`✅ ${lead.business} → ${lead.to}`);
      sent++;
    } catch (err: any) {
      console.error(`❌ ${lead.business} → ${lead.to}: ${err?.message}`);
      failed++;
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\n📊 Done: ${sent} sent, ${failed} failed out of ${leads.length} total\n`);
}

sendAll();
