import * as dotenv from 'dotenv';
dotenv.config();

const TELNYX_API_KEY = process.env.TELNYX_API_KEY;
const FROM_NUMBER = process.env.TELNYX_PHONE_NUMBER || '+16157163328';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.solomonslogic.com';
const TELNYX_CONNECTION_ID = process.env.TELNYX_CONNECTION_ID;

if (!TELNYX_API_KEY) {
  console.error('❌ TELNYX_API_KEY not set in .env');
  process.exit(1);
}

if (!TELNYX_CONNECTION_ID) {
  console.error('❌ TELNYX_CONNECTION_ID not set in .env');
  process.exit(1);
}

const target = { phone: '+17169394226', business: 'Mike Janico (Test)', industry: 'Software' };

async function callBusiness() {
  const webhookUrl = `${APP_URL}/api/texml/outbound-pitch`;

  const res = await fetch(`https://api.telnyx.com/v2/texml/calls/${TELNYX_CONNECTION_ID}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TELNYX_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      To: target.phone,
      From: FROM_NUMBER,
      Url: webhookUrl,
      Method: 'POST'
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(JSON.stringify(json?.errors || json));
  }
  return json;
}

async function runCampaign() {
  console.log('\n📞 Solomon\'s Logic — AI Outbound Cold Caller (TEST MODE - TeXML)');
  console.log(`📤 Calling from: ${FROM_NUMBER}`);
  console.log(`🤖 Sara will pitch live when you answer\n`);

  try {
    const call = await callBusiness();
    console.log(`✅ Dialing ${target.business} (${target.phone})`);
  } catch (err: any) {
    console.error(`❌ Failed to call ${target.business}:`, err?.message || err);
  }

  console.log('\n✅ Test call initiated. Pick up the phone!\n');
}

runCampaign();
