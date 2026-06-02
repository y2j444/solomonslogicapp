/**
 * Solomon's Logic — AI Outbound Cold Caller
 *
 * Uses Telnyx to call local Nashville businesses.
 * When they answer, Sara automatically pitches them as a live demo.
 * This is the most powerful zero-cost outreach — they hear the AI LIVE.
 *
 * How it works:
 * 1. Telnyx dials the business
 * 2. When answered, Telnyx connects the call to your LiveKit SIP endpoint
 * 3. Sara answers and delivers a live pitch
 * 4. If they're interested, she transfers them to you
 *
 * Run: npx tsx scratch/ai_cold_caller.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

const TELNYX_API_KEY = process.env.TELNYX_API_KEY;
const FROM_NUMBER = process.env.TELNYX_PHONE_NUMBER || '+16157163328';
// Your LiveKit SIP URI — Sara will answer when they pick up
const LIVEKIT_SIP_URI = process.env.LIVEKIT_SIP_URI || 'sip:solomonslogic@sip.livekit.cloud';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.solomonslogic.com';

if (!TELNYX_API_KEY) {
  console.error('❌ TELNYX_API_KEY not set in .env');
  process.exit(1);
}

// Nashville businesses to call — targeting owner/manager lines
const targets = [
  { phone: '+16152550603', business: 'Maynard Plumbing', industry: 'Plumbing & HVAC' },
  { phone: '+16158347663', business: 'ABCO Roofing', industry: 'Roofing' },
  { phone: '+16152673129', business: 'Don Kennedy Roofing', industry: 'Roofing' },
  { phone: '+16154716255', business: 'Parthenon Plumbing', industry: 'Plumbing' },
  { phone: '+16158917786', business: 'Modern Mechanical', industry: 'HVAC' },
];

/**
 * Initiate a Telnyx outbound call.
 * When answered, it routes to a TeXML webhook that connects Sara.
 */
async function callBusiness(target: typeof targets[0]) {
  const webhookUrl = `${APP_URL}/api/texml/outbound-pitch`;

  const res = await fetch('https://api.telnyx.com/v2/calls', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TELNYX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      connection_id: process.env.TELNYX_CONNECTION_ID || undefined,
      to: target.phone,
      from: FROM_NUMBER,
      webhook_url: webhookUrl,
      // Pass business context in metadata so Sara knows who she's calling
      metadata: JSON.stringify({
        mode: 'outbound_pitch',
        targetBusiness: target.business,
        industry: target.industry,
      }),
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(JSON.stringify(json?.errors || json));
  }
  return json.data;
}

async function runCampaign() {
  console.log('\n📞 Solomon\'s Logic — AI Outbound Cold Caller');
  console.log(`📤 Calling from: ${FROM_NUMBER}`);
  console.log(`🤖 Sara will pitch live when they answer\n`);

  for (const target of targets) {
    try {
      const call = await callBusiness(target);
      console.log(`✅ Dialing ${target.business} (${target.phone}) — Call ID: ${call.call_control_id}`);
    } catch (err: any) {
      console.error(`❌ Failed to call ${target.business}:`, err?.message || err);
    }
    // Wait 60 seconds between calls so calls don't all run simultaneously
    if (target !== targets[targets.length - 1]) {
      console.log('   ⏱  Waiting 60s before next call...');
      await new Promise(r => setTimeout(r, 60_000));
    }
  }

  console.log('\n✅ Outbound campaign initiated. Monitor calls in your Telnyx dashboard.\n');
}

runCampaign();
