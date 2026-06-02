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

const pitches = [
  {
    to: '+16159916311',
    business: 'Lee Company',
    message: `Hi, this is Mike, a Nashville local. I noticed Lee Company offers 24/7 service. I built an AI receptionist specifically for HVAC & Plumbing that handles emergency calls and bookings instantly, without putting people on hold. Call (615) 716-3328 to hear how real she sounds. Let me know if you want to try it out. - Mike`
  },
  {
    to: '+16152550603',
    business: 'Maynard Plumbing',
    message: `Hey, this is Mike. I run a tech company in Nashville. I built an AI receptionist that answers calls for HVAC/Plumbing businesses when the team is tied up. It sounds totally human and books directly to your calendar. Check it out at (615) 716-3328. First 30 days are on me if you want to try it. - Mike`
  },
  {
    to: '+16159134936',
    business: 'Service Experts Nashville',
    message: `Hi, Mike here. I built a voice AI that answers calls for local service experts when lines are busy. It talks like a real receptionist and books appointments. You can test it by calling (615) 716-3328. Would love to get your feedback on it. - Mike`
  },
  {
    to: '+16154716255',
    business: 'Parthenon Plumbing',
    message: `Hey, this is Mike from Nashville. I built an AI receptionist to make sure local plumbers never miss a job opportunity from an unanswered call. It sounds remarkably human. Give it a test run: (615) 716-3328. Let me know what you think! - Mike`
  },
  {
    to: '+16158917786',
    business: 'Modern Mechanical',
    message: `Hi, Mike here. I noticed Modern Mechanical offers 24/7 emergency service. My AI receptionist ensures every after-hours call is answered immediately by a human-sounding voice that can take down job details. Try calling her at (615) 716-3328. - Mike`
  },
  {
    to: '+16158004355',
    business: 'Nashville Roofing Company',
    message: `Hey, this is Mike. Every missed call during storm season is a lost roofing job. I built an AI receptionist that answers every call, qualifies the lead, and schedules a quote. Test it yourself: (615) 716-3328. If it's not for you, no worries. - Mike`
  },
  {
    to: '+16158347663',
    business: 'ABCO Roofing',
    message: `Hi, Mike here (Nashville local). I built an AI receptionist for contractors. It answers your phone when you're on a roof and books estimates directly into your calendar. Call (615) 716-3328 to hear how real she sounds. First month free to try. - Mike`
  },
  {
    to: '+16159004000',
    business: 'Music City Roofers',
    message: `Hey, this is Mike. Music City Roofers is highly rated, meaning you probably get a lot of calls. I built an AI receptionist that ensures you never miss one. It sounds like a real person and books jobs 24/7. Call (615) 716-3328 to see what I mean. - Mike`
  },
  {
    to: '+16152673129',
    business: 'Don Kennedy Roofing',
    message: `Hi, Mike here. I built an AI phone assistant for established contractors like Don Kennedy Roofing. It handles overflow calls and after-hours inquiries perfectly. You can test her by calling (615) 716-3328. Would love to hear your thoughts. - Mike`
  },
  {
    to: '+16159332288',
    business: 'Pioneer Heating & Cooling',
    message: `Hey, this is Mike from Nashville. I built an AI receptionist that answers calls for HVAC companies when all techs are busy. It sounds 100% human and books appointments. Call (615) 716-3328 to try it out. Happy to let you use it free for a month. - Mike`
  }
];

async function sendAll() {
  console.log(`\n🚀 Solomon's Logic — Outbound Pitch Engine (Batch 2)`);
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

  console.log(`\n✅ Batch 2 complete. Monitor replies in your Telnyx portal and CRM.\n`);
}

sendAll();
