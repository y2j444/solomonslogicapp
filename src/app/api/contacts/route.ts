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
