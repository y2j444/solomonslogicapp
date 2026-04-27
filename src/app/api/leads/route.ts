import { NextResponse } from "next/server";
import { LeadStage } from "@prisma/client";
import { getCurrentUserRecord } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUserRecord();
  const leads = await prisma.lead.findMany({
    where: { ownerUserId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(leads);
}

export async function POST(req: Request) {
  const user = await getCurrentUserRecord();
  const body = (await req.json()) as { leadTitle?: string; source?: string; dealValue?: number };
  if (!body.leadTitle) {
    return NextResponse.json({ error: "leadTitle is required" }, { status: 400 });
  }
  const lead = await prisma.lead.create({
    data: {
      leadTitle: body.leadTitle,
      stage: LeadStage.New,
      dealValue: body.dealValue ?? 0,
      source: body.source ?? "Unknown",
      ownerUserId: user.id,
    },
  });
  return NextResponse.json(lead, { status: 201 });
}
