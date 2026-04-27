import { NextResponse } from "next/server";
import { AppointmentType } from "@prisma/client";
import { getCurrentUserRecord } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

type CreateAppointmentPayload = {
  contactId?: string;
  title?: string;
  startTime?: string;
  durationMinutes?: number;
  type?: AppointmentType;
  notes?: string;
};

function isValidDate(value: string) {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export async function GET() {
  const user = await getCurrentUserRecord();

  const appointments = await prisma.appointment.findMany({
    where: { ownerUserId: user.id },
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json(appointments);
}

export async function POST(request: Request) {
  const user = await getCurrentUserRecord();
  const body = (await request.json()) as CreateAppointmentPayload;

  const title = String(body.title ?? "").trim();
  const startTime = String(body.startTime ?? "").trim();
  const durationMinutes = Number(body.durationMinutes ?? 30) || 30;

  if (!title || !startTime) {
    return NextResponse.json(
      {
        error: "title and startTime are required",
      },
      { status: 400 }
    );
  }

  if (!isValidDate(startTime)) {
    return NextResponse.json(
      {
        error: "Invalid startTime. Use an ISO 8601 date string.",
      },
      { status: 400 }
    );
  }

  const appointment = await prisma.appointment.create({
    data: {
      title,
      contactId: body.contactId || null,
      startTime: new Date(startTime),
      durationMinutes,
      type: body.type ?? AppointmentType.PhoneCall,
      notes: body.notes ?? null,
      ownerUserId: user.id,
    },
  });

  return NextResponse.json(appointment, { status: 201 });
}