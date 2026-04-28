import { NextResponse } from "next/server";
import { ContactStatus } from "@prisma/client";
import { getCurrentUserRecord } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUserRecord();
  const contacts = await prisma.contact.findMany({
    where: { ownerUserId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(contacts);
}

export async function POST(req: Request) {
  const user = await getCurrentUserRecord();
  const body = (await req.json()) as {
    fullName?: string;
    email?: string;
    phone?: string;
    company?: string;
    notes?: string;
  };
  if (!body.fullName) {
    return NextResponse.json({ error: "fullName is required" }, { status: 400 });
  }
  const contact = await prisma.contact.create({
    data: {
      fullName: body.fullName,
      email: body.email ?? null,
      phone: body.phone ?? null,
      company: body.company ?? null,
      notes: body.notes ?? null,
      status: ContactStatus.Prospect,
      ownerUserId: user.id,
    },
  });
  return NextResponse.json(contact, { status: 201 });
}

export async function PUT(req: Request) {
  const user = await getCurrentUserRecord();
  const body = (await req.json()) as {
    id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    company?: string;
    notes?: string;
    status?: string;
  };

  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  if (!body.fullName) {
    return NextResponse.json({ error: "fullName is required" }, { status: 400 });
  }

  const contact = await prisma.contact.findUnique({
    where: { id: body.id },
  });

  if (!contact || contact.ownerUserId !== user.id) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  const updated = await prisma.contact.update({
    where: { id: body.id },
    data: {
      fullName: body.fullName,
      email: body.email ?? null,
      phone: body.phone ?? null,
      company: body.company ?? null,
      notes: body.notes ?? null,
      status: (body.status as ContactStatus) ?? contact.status,
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

  const contact = await prisma.contact.findUnique({
    where: { id },
  });

  if (!contact || contact.ownerUserId !== user.id) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  await prisma.contact.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

