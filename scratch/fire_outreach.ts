import Telnyx from 'telnyx';
import * as dotenv from 'dotenv';
dotenv.config();

const telnyx = new (Telnyx as any)(process.env.TELNYX_API_KEY);
const FROM = process.env.TELNYX_PHONE_NUMBER || '+16157163328';

// 5 warm Nashville leads — personalized per business
const leads = [
  {
    name: "Smooth Saling Plumbing",
    phone: "+16158151502",
    msg: `Hey, this is Mike with Solomon's Logic here in Nashville. Quick question — when your crew is out on a job and a new customer calls, what happens to that call? We built a 24/7 AI receptionist called Sara that picks up instantly and books appointments right into your calendar. She sounds completely natural — most callers don't know she's not human. Our demo line is (615) 716-3328 if you want to call and try her yourself. Happy to chat if it's a fit.`
  },
  {
    name: "Morton Plumbing Heating & Cooling",
    phone: "+16152552527",
    msg: `Hey, hope your week is going well. My name's Mike — I run Solomon's Logic, a small tech company here in Nashville. We specialize in AI receptionists for local service businesses like yours. The way it works is simple: calls forward to a dedicated number, our AI named Sara picks up in under a second, answers questions, and books appointments directly into your calendar. No missed calls, no voicemail. You can literally call our live demo at (615) 716-3328 and talk to her right now. Would love to show you how it works for Morton's.`
  },
  {
    name: "Wehby Plumbing",
    phone: "+16152557424",
    msg: `Hi there — my name's Mike, I'm local here in Nashville. I noticed Wehby Plumbing has been serving this community for a long time — that's impressive. I wanted to reach out because we built something that helps businesses like yours never miss a call again. It's an AI receptionist named Sara — she answers instantly, sounds warm and professional, and books jobs right into your schedule. A lot of plumbers lose $500+ per missed call. You can try Sara yourself right now by calling (615) 716-3328. No pitch — just see how she sounds. Happy to chat if it makes sense.`
  },
  {
    name: "Ona Skincare",
    phone: "+16158108785",
    msg: `Hi! My name's Mike — I'm a local entrepreneur here in Nashville. Quick thought: when your estheticians are mid-treatment and a new client calls, that call usually goes to voicemail, right? We built an AI receptionist named Sara specifically for clinics like Ona. She answers immediately, sounds completely human, and books consultations right into your calendar around the clock. A missed booking in your world is often $200+ gone. Our demo line is (615) 716-3328 — give her a call and try to book something. I think you'll be surprised. Let me know if you'd like to chat!`
  },
  {
    name: "Nashville Skin Society",
    phone: "+16158668653",
    msg: `Hey, this is Mike from Solomon's Logic in Nashville. I'll keep it short — we built an AI receptionist called Sara for medical aesthetics clinics. She answers every call in under a second, handles questions, and books Botox and filler consultations automatically. Most practices we work with were losing 8-10 calls a week to voicemail. You can try Sara right now by calling (615) 716-3328. She's live. Let me know if you'd want to see how she'd sound representing Nashville Skin Society specifically — happy to set up a quick custom demo.`
  }
];

async function send(lead: { name: string; phone: string; msg: string }) {
  try {
    const res = await telnyx.messages.send({
      from: FROM,
      to: lead.phone,
      text: lead.msg
    });
    console.log(`✅ Sent to ${lead.name} (${lead.phone}) — ID: ${(res as any).data?.id}`);
  } catch (err: any) {
    console.error(`❌ Failed for ${lead.name} (${lead.phone}):`, err?.message || err);
  }
}

async function main() {
  console.log(`\n🚀 SOLOMON'S LOGIC — OUTREACH FIRING\n`);
  console.log(`From: ${FROM}`);
  console.log(`Leads: ${leads.length}\n`);

  for (const lead of leads) {
    console.log(`📤 Sending to ${lead.name}...`);
    await send(lead);
    // 2 second gap between sends to avoid rate limiting
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\n✅ All outreach fired. Check your CRM for responses.\n`);
  process.exit(0);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
