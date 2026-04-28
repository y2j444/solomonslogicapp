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

export async function PUT(req: Request) {
  const user = await getCurrentUserRecord();
  const body = (await req.json()) as {
    id?: string;
    leadTitle?: string;
    stage?: string;
    source?: string;
    dealValue?: number;
    notes?: string;
  };

  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  if (!body.leadTitle) {
    return NextResponse.json({ error: "leadTitle is required" }, { status: 400 });
  }

  const lead = await prisma.lead.findUnique({
    where: { id: body.id },
  });

  if (!lead || lead.ownerUserId !== user.id) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const updated = await prisma.lead.update({
    where: { id: body.id },
    data: {
      leadTitle: body.leadTitle,
      stage: (body.stage as LeadStage) ?? lead.stage,
      dealValue: body.dealValue ?? lead.dealValue,
      source: body.source ?? lead.source,
      notes: body.notes ?? lead.notes,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const user = await getCurrentUserRecord();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const lead = await prisma.lead.findUnique({
    where: { id },
  });

  if (!lead || lead.ownerUserId !== user.id) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  await prisma.lead.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

