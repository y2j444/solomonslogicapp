import * as dotenv from 'dotenv';
dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.solomonslogic.com';

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  console.error('❌ Twilio credentials missing in .env');
  process.exit(1);
}

const targetPhone = '+17169394226';

async function callBusiness() {
  const webhookUrl = `${APP_URL}/api/texml/outbound-pitch`;
  
  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
  
  const params = new URLSearchParams();
  params.append('To', targetPhone);
  params.append('From', TWILIO_PHONE_NUMBER as string);
  params.append('Url', webhookUrl);

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(JSON.stringify(json));
  }
  return json;
}

async function runCampaign() {
  console.log('\n📞 Solomon\'s Logic — AI Outbound Cold Caller (TEST MODE - TWILIO)');
  console.log(`📤 Calling from: ${TWILIO_PHONE_NUMBER}`);
  console.log(`🤖 Sara will pitch live when you answer\n`);

  try {
    const call = await callBusiness();
    console.log(`✅ Dialing ${targetPhone} — Call SID: ${call.sid}`);
  } catch (err: any) {
    console.error(`❌ Failed to call:`, err?.message || err);
  }

  console.log('\n✅ Test call initiated via Twilio. Pick up the phone!\n');
}

runCampaign();
