import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "michael.janico@solomonslogic.com";
const LEADS_FILE = path.join(process.cwd(), "reports", "scraped_leads.json");

export const dynamic = "force-dynamic";

async function assertAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;
  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { email: true },
  });
  return user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

function loadLeads() {
  if (!fs.existsSync(LEADS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(LEADS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveLeads(leads: any[]) {
  fs.mkdirSync(path.dirname(LEADS_FILE), { recursive: true });
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}

/** GET /api/admin/free-leads — list all scraped leads */
export async function GET() {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(loadLeads());
}

/** POST /api/admin/free-leads — send pitch email to a specific lead */
export async function POST(req: Request) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email } = await req.json();
  const leads = loadLeads();
  const lead = leads.find((l: any) => l.email === email);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    return NextResponse.json({ error: "Gmail credentials not configured" }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailPass },
  });

  const subject = `Quick question about missed calls at ${lead.business}`;
  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
    <p>Hi there,</p>
    <p>My name is Mike — I'm a developer based here in Nashville.</p>
    <p>I built an AI phone receptionist called <strong>Sara</strong> specifically for ${lead.industry} businesses. She answers your phone when you're on a job, sounds completely human, and books appointments directly into your calendar — 24/7, including nights and weekends.</p>
    <p><strong>You can hear her right now</strong> — just call <a href="tel:+16157163328" style="color: #355cc9;">(615) 716-3328</a> and ask to book something. Takes 60 seconds.</p>
    <p>For ${lead.business}, this means:</p>
    <ul>
      <li>✅ Every emergency call gets answered — even at 2 AM</li>
      <li>✅ No more lost jobs to voicemail</li>
      <li>✅ Appointments booked automatically into your schedule</li>
      <li>✅ Setup takes 3 minutes — just forward your calls</li>
    </ul>
    <p>You can <strong>try it for a month completely free</strong>. After that, it's $199/month — less than one lost job per month likely costs you. No contracts, cancel anytime.</p>
    <p>Get started at <a href="https://app.solomonslogic.com" style="color: #355cc9;">app.solomonslogic.com</a> or just reply to this email.</p>
    <p>Thanks,<br><strong>Mike Janico</strong><br>Founder, Solomon's Logic<br>
    <a href="tel:+16157163328" style="color: #355cc9;">(615) 716-3328</a></p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
    <p style="font-size: 12px; color: #999;">You're receiving this because you run a local Nashville business. Reply STOP and I'll remove you immediately.</p>
  </div>`;

  await transporter.sendMail({
    from: `Mike Janico <${gmailUser}>`,
    to: lead.email,
    subject,
    html,
  });

  // Update status to "sent"
  const updated = leads.map((l: any) =>
    l.email === email ? { ...l, status: "sent", sentAt: new Date().toISOString() } : l
  );
  saveLeads(updated);

  return NextResponse.json({ success: true });
}

/** PATCH /api/admin/free-leads — update lead status */
export async function PATCH(req: Request) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, status } = await req.json();
  const leads = loadLeads();
  const updated = leads.map((l: any) =>
    l.email === email ? { ...l, status } : l
  );
  saveLeads(updated);

  return NextResponse.json({ success: true });
}
