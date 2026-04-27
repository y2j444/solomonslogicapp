import { NextResponse } from "next/server";
import { CallAppointmentStatus, CallDirection } from "@prisma/client";
import { getCurrentUserRecord } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUserRecord();
  const callLogs = await prisma.callLog.findMany({
    where: { ownerUserId: user.id },
    orderBy: { calledAt: "desc" },
  });
  return NextResponse.json(callLogs);
}

export async function POST(req: Request) {
  const user = await getCurrentUserRecord();
  const body = (await req.json()) as {
    callerPhone?: string;
    callSid?: string;
    direction?: "Inbound" | "Outbound";
    durationSeconds?: number;
    aiSummary?: string;
  };
  if (!body.callerPhone || !body.callSid) {
    return NextResponse.json({ error: "callerPhone and callSid are required" }, { status: 400 });
  }
  const callLog = await prisma.callLog.create({
    data: {
      callerPhone: body.callerPhone,
      callSid: body.callSid,
      durationSeconds: body.durationSeconds ?? 0,
      direction:
        body.direction === "Outbound" ? CallDirection.Outbound : CallDirection.Inbound,
      aiSummary: body.aiSummary ?? null,
      appointmentStatus: CallAppointmentStatus.PendingReview,
      ownerUserId: user.id,
    },
  });
  return NextResponse.json(callLog, { status: 201 });
}
