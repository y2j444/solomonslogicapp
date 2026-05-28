import { PrismaClient } from '@prisma/client';
import Telnyx from 'telnyx';
import { OpenAI } from 'openai';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config();

const prisma = new PrismaClient();

// Validate critical keys
const telnyxKey = process.env.TELNYX_API_KEY;
const telnyxFrom = process.env.TELNYX_PHONE_NUMBER || '+16157163328';
const openaiKey = process.env.OPENAI_API_KEY;

// The main user ID we are working on (Solomons Logic LLC)
const OWNER_USER_ID = 'cmobopaji0000wemgyqznk71z'; 

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

// Premium sales console UI headers
function printHeader() {
  console.log("\x1b[36m====================================================================\x1b[0m");
  console.log("\x1b[35m         SOLOMON'S LOGIC - CHIEF SALES OFFICER ACTIVATED            \x1b[0m");
  console.log("\x1b[33m      \"Don't sell features. Sell booked jobs and found money.\"      \x1b[0m");
  console.log("\x1b[36m====================================================================\x1b[0m\n");
}

async function injectSampleLeads() {
  console.log("\x1b[34m[CSO] Locating high-value prospects in your area...\x1b[0m");
  
  const leadsToInject = [
    {
      name: "Owner",
      company: "Smooth Saling Plumbing",
      phone: "+16158151502",
      email: "contact@smoothsalingplumbing.com",
      niche: "Residential Plumbing & Leak Detection",
      dealValue: 2400.00,
      notes: "Website focuses on 'speak to real people rather than call centers.' If their lines are busy on a plumbing call, our low-latency AI ('Sara') answers in <200ms with a warm, local touch, keeping that promise 24/7."
    },
    {
      name: "Service Manager",
      company: "Morton Plumbing, Heating & Cooling",
      phone: "+16152552527",
      email: "service@mortonplumbing.net",
      niche: "Full-Service Residential Plumbing & HVAC",
      dealValue: 3200.00,
      notes: "Highly rated, long-standing Nashville provider. Needs a low-latency safety net for urgent after-hours pipe bursts and emergency calls."
    },
    {
      name: "Owner",
      company: "Wehby Plumbing",
      phone: "+16152557424",
      email: "office@wehbyplumbing.com",
      niche: "Residential & Commercial Plumbing Repairs",
      dealValue: 2800.00,
      notes: "Locally owned since 1959. Perfect candidate to modernize their front-office operations and automate schedule bookings."
    },
    {
      name: "Lead Esthetician",
      company: "Ona Skincare",
      phone: "+16158108785",
      email: "hello@onaskin.com",
      niche: "Boutique MedSpa & Skincare Clinic",
      dealValue: 4500.00,
      notes: "Busy Fatherland St clinic. Staff are frequently hands-on in treatments (facials, skincare). A missed call is an immediate $200+ direct session loss plus patient lifetime value."
    },
    {
      name: "Practice Manager",
      company: "Nashville Skin Society",
      phone: "+16158668653",
      email: "hello@nashvilleskinsociety.com",
      niche: "Medical Aesthetics & Skincare",
      dealValue: 3900.00,
      notes: "Nolensville Pike medical aesthetics clinic. Offers high-ticket dermal fillers and Botox injections. A single missed consultation represents a direct $1,000+ customer lifecycle leak."
    }
  ];

  let injectedCount = 0;
  for (const lead of leadsToInject) {
    // Check if contact already exists
    let contact = await prisma.contact.findFirst({
      where: {
        phone: lead.phone,
        ownerUserId: OWNER_USER_ID
      }
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          fullName: lead.name,
          phone: lead.phone,
          email: lead.email,
          company: lead.company,
          status: 'Prospect',
          notes: `Target niche: ${lead.niche}. Niche Pain Point: ${lead.notes}`,
          ownerUserId: OWNER_USER_ID
        }
      });

      await prisma.lead.create({
        data: {
          leadTitle: `${lead.company} - AI Receptionist Retainer`,
          contactId: contact.id,
          stage: 'New',
          dealValue: lead.dealValue,
          source: 'CSO Outreach Engine',
          notes: lead.notes,
          ownerUserId: OWNER_USER_ID
        }
      });
      console.log(`\x1b[32m✔ Loaded Lead: ${lead.company} | Contact: ${lead.name} | Potential Deal: $${lead.dealValue}\x1b[0m`);
      injectedCount++;
    }
  }

  if (injectedCount === 0) {
    console.log("\x1b[33mℹ Leads are already populated and active in your CRM dashboard.\x1b[0m");
  } else {
    console.log(`\x1b[32m✔ Successfully injected ${injectedCount} high-value leads into your CRM database!\x1b[0m`);
  }
}

async function generatePitch(leadName: string, company: string, niche: string, pain: string): Promise<string> {
  const defaultFallback = `Hi ${leadName}, this is the team at Solomon's Logic. We noticed that calls to ${company} go unanswered after hours, which is costing you business. We built "Sara", a real-time AI receptionist that answers on the first ring and books jobs directly into your calendar. Call our test line at +16157163328 to see how she sounds!`;

  if (!openaiKey) {
    return defaultFallback;
  }

  try {
    console.log(`\x1b[34m[CSO] Utilizing AI to analyze ${company} and formulate the perfect sales copy...\x1b[0m`);
    const openai = new OpenAI({ apiKey: openaiKey });

    const prompt = `You are the absolute best, most charismatic, high-converting B2B salesperson in the world. 
You are writing a cold outreach SMS pitch to a business owner.
Recipient details:
- Owner Name: ${leadName}
- Business Name: ${company}
- Industry: ${niche}
- Specific Revenue Leak: ${pain}

Your company is "Solomon's Logic" and our product is a low-latency, hyper-realistic AI Receptionist named "Sara" who:
1. Answers instantly (sub-200ms lag) in a warm, professional voice.
2. Books appointments directly into their existing calendar.
3. Populates a dedicated CRM so they never lose a lead.

Call to action: Invite them to call our live demo number +16157163328 to experience "Sara" right now on the phone.

Rules:
- Keep the SMS extremely concise, compelling, and conversational (under 160 words).
- Speak directly to the massive dollar amount they are losing from missed calls.
- DO NOT sound robotic, spammy, or overly formal. Write like a sharp, helpful local entrepreneur.
- Do not use hashtags or generic sales templates. Focus on "found money."`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an elite sales copywriter who specializes in converting cold business owners.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || defaultFallback;
  } catch (error) {
    console.log("\x1b[33m⚠ OpenAI API Error (Possibly invalid/expired key). Falling back to premium pre-written template...\x1b[0m");
    return defaultFallback;
  }
}

async function sendOutreachSMS(toPhone: string, body: string) {
  if (!telnyxKey) {
    console.log("\x1b[31m✖ Error: Telnyx API key not configured in `.env` (TELNYX_API_KEY).\x1b[0m");
    return false;
  }

  const telnyx = new (Telnyx as any)(telnyxKey);
  console.log(`\x1b[34m[CSO] Deploying pitch to ${toPhone} from our outbound Telnyx line (${telnyxFrom})...\x1b[0m`);

  try {
    const message = await telnyx.messages.send({
      text: body,
      from: telnyxFrom,
      to: toPhone
    });

    console.log(`\x1b[32m✔ Pitch sent successfully! Telnyx Message ID: ${message.id}\x1b[0m`);

    // Log the message in the database so it appears in the dashboard CRM in real-time
    let contact = await prisma.contact.findFirst({
      where: { phone: toPhone, ownerUserId: OWNER_USER_ID }
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          fullName: "Valued Prospect",
          phone: toPhone,
          company: "Outreach Lead",
          status: 'Prospect',
          ownerUserId: OWNER_USER_ID
        }
      });
    }

    await prisma.smsMessage.create({
      data: {
        phone: toPhone,
        message: body,
        role: 'Outbound',
        contactId: contact.id,
        ownerUserId: OWNER_USER_ID
      }
    });

    console.log("\x1b[32m✔ SMS outreach logged to CRM database. Open http://localhost:3000 to see your leads!\x1b[0m");
    return true;
  } catch (error) {
    console.error("\x1b[31m✖ Telnyx transmission failed:\x1b[0m", error);
    return false;
  }
}

async function main() {
  printHeader();

  while (true) {
    console.log("\n\x1b[1m=== CSO SALES CONTROL BOARD ===\x1b[0m");
    console.log("1. Scan & Inject Local CRM Leads (Plumbers, MedSpas, HVAC)");
    console.log("2. Pitch Yourself Live (Experience the pitch on your own cell phone!)");
    console.log("3. Display CRM Pipeline Summary");
    console.log("4. Exit Console");

    const choice = await askQuestion("\nSelect an action [1-4]: ");

    if (choice === '1') {
      console.log("");
      await injectSampleLeads();
    } 
    else if (choice === '2') {
      console.log("\n\x1b[35m=== RUN SELF-PITCH PIPELINE ===\x1b[0m");
      const name = await askQuestion("Enter your first name (e.g. Mike): ");
      const company = await askQuestion("Enter your target business name (e.g. Dallas Plumbers): ");
      const phoneInput = await askQuestion("Enter your mobile number (e.g. 7169394226): ");

      let phone = phoneInput.trim();
      if (!phone.startsWith("+")) {
        if (phone.length === 10) {
          phone = "+1" + phone;
        } else if (phone.length === 11 && phone.startsWith("1")) {
          phone = "+" + phone;
        }
      }

      if (!phone.startsWith("+") || phone.length < 10) {
        console.log("\x1b[31m✖ Error: Phone number must be in proper E.164 format (+1 followed by 10 digits).\x1b[0m");
        continue;
      }

      console.log("");
      const pitch = await generatePitch(
        name,
        company,
        "Premium Services",
        "Your office is backed up with manual labor and you fail to answer incoming client phone calls during busy hours or late evenings. Each missed call costs you hundreds of dollars in lost jobs."
      );

      console.log("\x1b[33m--- Generated Sales Pitch ---\x1b[0m");
      console.log(`\x1b[37m"${pitch}"\x1b[0m`);
      console.log("\x1b[33m-----------------------------\x1b[0m\n");

      const confirm = await askQuestion("Do you want your CSO to send this live SMS pitch to your phone? (y/n): ");
      if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
        await sendOutreachSMS(phone, pitch);
      } else {
        console.log("\x1b[33m✔ Lead saved, pitch deferred.\x1b[0m");
      }
    } 
    else if (choice === '3') {
      console.log("\n\x1b[34m[CSO] Loading live CRM dashboard pipeline...\x1b[0m");
      const leads = await prisma.lead.findMany({
        where: { ownerUserId: OWNER_USER_ID },
        include: { contact: true }
      });

      const smsCount = await prisma.smsMessage.count({
        where: { ownerUserId: OWNER_USER_ID }
      });

      console.log("\n\x1b[1m--- LIVE SALES PIPELINE ---\x1b[0m");
      console.log(`Total Active Leads: ${leads.length}`);
      console.log(`Total Outbound Pitch Messages Dispatched: ${smsCount}\n`);

      leads.forEach((l, idx) => {
        console.log(`[Lead #${idx+1}]`);
        console.log(`Company: \x1b[32m${l.contact?.company || 'Unknown'}\x1b[0m`);
        console.log(`Contact: ${l.contact?.fullName || 'N/A'} (${l.contact?.phone || 'N/A'})`);
        console.log(`Deal Pipeline Value: \x1b[33m$${l.dealValue}\x1b[0m`);
        console.log(`Stage: [${l.stage}] | Source: ${l.source}`);
        console.log(`Brief: ${l.notes}`);
        console.log("-----------------------------------------");
      });
    } 
    else if (choice === '4') {
      console.log("\x1b[35m[CSO] Standing down. Remember: Missed calls are missed revenue. Let's go close some deals!\x1b[0m");
      break;
    } 
    else {
      console.log("\x1b[31m✖ Invalid selection. Try again.\x1b[0m");
    }
  }

  rl.close();
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("CSO encountered a fatal error during outreach operations:", e);
  await prisma.$disconnect();
  process.exit(1);
});
