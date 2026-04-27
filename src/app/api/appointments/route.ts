import { NextResponse } from "next/server";
import {
  AppointmentType,
  CallAppointmentStatus,
  CallDirection,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

type VapiToolCallPayload = {
  message?: {
    toolCallList?: Array<{
      function?: {
        name?: string;
        arguments?: string | Record<string, unknown>;
      };
      arguments?: string | Record<string, unknown>;
    }>;
    toolCalls?: Array<{
      function?: {
        name?: string;
        arguments?: string | Record<string, unknown>;
      };
      arguments?: string | Record<string, unknown>;
    }>;
  };
  toolCallList?: Array<{
    function?: {
      name?: string;
      arguments?: string | Record<string, unknown>;
    };
    arguments?: string | Record<string, unknown>;
  }>;
  twilioPhone?: string;
  callerPhone?: string;
  callerName?: string;
  appointmentTitle?: string;
  startTime?: string;
  durationMinutes?: number;
  notes?: string;
};

function readArguments(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (typeof value === "object") return value as Record<string, unknown>;
  return {};
}

export async function POST(request: Request) {
  const body = (await request.json()) as VapiToolCallPayload;

  const toolCalls =
    body.message?.toolCallList ??
    body.message?.toolCalls ??
    body.toolCallList ??
    [];

  const firstToolCall = toolCalls[0];
  const args = {
    ...readArguments(firstToolCall?.function?.arguments),
    ...readArguments(firstToolCall?.arguments),
    ...readArguments(body),
  };

  const twilioPhone = String(
    args.twilioPhone ?? body.twilioPhone ?? ""
  ).trim();
  const callerPhone = String(
    args.callerPhone ?? body.callerPhone ?? ""
  ).trim();
  const callerName = String(
    args.callerName ?? body.callerName ?? ""
  ).trim();
  const appointmentTitle = String(
    args.appointmentTitle ?? body.appointmentTitle ?? "Voice AI booking"
  ).trim();
  const startTime = String(args.startTime ?? body.startTime ?? "").trim();
  const notes = String(args.notes ?? body.notes ?? "Booked from Vapi webhook");
  const durationMinutes =
    Number(args.durationMinutes ?? body.durationMinutes ?? 30) || 30;

  if (!twilioPhone || !callerPhone || !startTime) {
    return NextResponse.json(
      {
        error:
          "Missing required booking data: twilioPhone, callerPhone, startTime",
      },
      { status: 400 }
    );
  }

  const user = await prisma.user.findFirst({
    where: { twilioPhone },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Business not found for twilioPhone" },
      { status: 404 }
    );
  }

  let contact = await prisma.contact.findFirst({
    where: { ownerUserId: user.id, phone: callerPhone },
  });

  if (!contact) {
    contact = await prisma.contact.create({
      data: {
        fullName: callerName || callerPhone,
        phone: callerPhone,
        notes: "Auto-created from Vapi booking",
        ownerUserId: user.id,
      },
    });
  }

  const appointment = await prisma.appointment.create({
    data: {
      title: appointmentTitle,
      contactId: contact.id,
      startTime: new Date(startTime),
      durationMinutes,
      type: AppointmentType.PhoneCall,
      notes,
      ownerUserId: user.id,
    },
  });

  await prisma.callLog.create({
    data: {
      callerPhone,
      callSid: `vapi_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      durationSeconds: 0,
      direction: CallDirection.Inbound,
      aiSummary: "Call handled by Vapi booking webhook.",
      contactId: contact.id,
      appointmentCreatedId: appointment.id,
      appointmentStatus: CallAppointmentStatus.AppointmentCreated,
      ownerUserId: user.id,
    },
  });

  return NextResponse.json({
    success: true,
    contact,
    appointment,
  });
}
