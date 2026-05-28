import Telnyx from 'telnyx';
import * as dotenv from 'dotenv';
dotenv.config();

const telnyxKey = process.env.TELNYX_API_KEY;
const FROM = process.env.TELNYX_PHONE_NUMBER || '+16157163328';

if (!telnyxKey) {
  console.error('❌ TELNYX_API_KEY not set in .env');
  process.exit(1);
}

const telnyx = new (Telnyx as any)(telnyxKey);

// 5 real Nashville businesses — human-voice messages, from "Mike"
const pitches = [
  {
    to: '+16158151502',
    business: 'Smooth Saling Plumbing',
    message: `Hey, this is Mike — I run a tech company here in Nashville. I noticed Smooth Saling's site says you talk to real people, not call centers. I love that.

I built an AI that answers your phone when you're on a job so that promise never breaks — even at 8pm. Sounds genuinely human. Try it: call (615) 716-3328 and ask to schedule something.

If it's not for you, no worries. Just thought it was worth a shot.
— Mike`,
  },
  {
    to: '+16158108785',
    business: 'Ona Skincare',
    message: `Hi! I'm Mike, Nashville local. I built an AI phone assistant for clinics like yours — it answers calls while your staff are in treatments and books appointments directly to your calendar.

A missed call from a skincare inquiry is easily $200–$400 gone. This fixes it. Try her yourself: call (615) 716-3328.

First 30 days are free. No strings.
— Mike`,
  },
  {
    to: '+16152552527',
    business: 'Morton Plumbing',
    message: `Hey, this is Mike. Quick question — what happens to your emergency calls after 5pm?

I built an AI receptionist that answers 24/7, talks like a real person, and books the job into your calendar. No lag, no hold music. Call (615) 716-3328 and test her yourself — takes 60 seconds.

Worth a shot.
— Mike`,
  },
  {
    to: '+16158668653',
    business: 'Nashville Skin Society',
    message: `Hi, Mike here — Nashville local. I built an AI receptionist for medical aesthetics clinics.

Every missed consultation call is a $500–$1,500 patient you handed to a competitor. Sara answers instantly, answers questions about your services, and schedules bookings automatically.

Try her now: call (615) 716-3328. First month is on me.
— Mike`,
  },
  {
    to: '+16152557424',
    business: 'Wehby Plumbing',
    message: `Hey, this is Mike. Wehby Plumbing has been around since 1959 — that kind of reputation is hard to build.

I built something that makes sure you never lose a job to a missed call. An AI that answers your phone, sounds like a real receptionist, and books jobs while you're working.

Call (615) 716-3328 and see for yourself. I'd love your honest feedback.
— Mike`,
  },
];

async function sendAll() {
  console.log(`\n🚀 Solomon's Logic — Outbound Pitch Engine`);
  console.log(`📤 Sending from: ${FROM}\n`);

  for (const pitch of pitches) {
    try {
      const msg = await telnyx.messages.send({
        from: FROM,
        to: pitch.to,
        text: pitch.message,
      });
      console.log(`✅ Sent to ${pitch.business} (${pitch.to}) — ID: ${(msg as any).id || 'sent'}`);
    } catch (err: any) {
      console.error(`❌ Failed → ${pitch.business} (${pitch.to}):`, err?.message || err);
    }
    // Small delay between messages to avoid rate limiting
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\n✅ Outreach complete. Monitor replies in your Telnyx portal and CRM.\n`);
}

sendAll();
