import Telnyx from 'telnyx';
import * as dotenv from 'dotenv';
dotenv.config();

const telnyxKey = process.env.TELNYX_API_KEY;
const FROM = process.env.TELNYX_PHONE_NUMBER || '+16157163328';
const TO = '+17169394226';

const telnyx = new (Telnyx as any)(telnyxKey);

const samplePitch = `Hi, this is Mike, a Nashville local. I noticed [Business Name] offers 24/7 service. I built an AI receptionist specifically for HVAC & Plumbing that handles emergency calls and bookings instantly, without putting people on hold. Call (615) 716-3328 to hear how real she sounds. Let me know if you want to try it out. - Mike`;

async function sendSample() {
  try {
    console.log(`Sending from ${FROM} to ${TO}...`);
    const msg = await telnyx.messages.send({
      from: FROM,
      to: TO,
      text: "Here is the sample pitch I've been sending to HVAC/Plumbing leads:\n\n" + samplePitch,
    });
    console.log(`✅ Sent sample pitch to ${TO}`);
    console.log(JSON.stringify(msg, null, 2));
  } catch (err: any) {
    console.error(`❌ Failed to send sample pitch:`);
    console.error(err);
  }
}

sendSample();
