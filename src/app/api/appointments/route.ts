import { NextResponse } from "next/server";
import {
  AppointmentType,
  CallAppointmentStatus,
  CallDirection,
} from "@prisma/client";
import { getCurrentUserRecord } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

type VapiToolCall = {
  id?: string;
  toolCallId?: string;
  function?: {
    name?: string;
    arguments?: string | Record<string, unknown>;
  };
  arguments?: string | Record<string, unknown>;
};

type AppointmentPayload = {
  message?: {
    toolCallList?: VapiToolCall[];
    toolCalls?: VapiToolCall[];
  };
  toolCallList?: VapiToolCall[];
  toolCalls?: VapiToolCall[];
  toolCallId?: string;
  twilioPhone?: string;
  callerPhone?: string;
  callerName?: string;
  appointmentTitle?: string;
  title?: string;
  contactId?: string;
  startTime?: string;
  durationMinutes?: number;
  type?: AppointmentType;
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

  if (typeof value === "object") {
    return value as Record<string, unknown>;
  }

  return {};
}

function normalizeUsPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  return "";
}

function isValidDate(value: string) {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function isPastAppointment(date: Date) {
  const fiveMinuteGraceMs = 5 * 60 * 1000;
  return date.getTime() < Date.now() - fiveMinuteGraceMs;
}

function formatAppointmentDate(date: Date) {
  return date.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function vapiResult(toolCallId: string | undefined, result: string, status = 200) {
  if (!toolCallId) {
    return NextResponse.json(
      {
        success: status < 400,
        message: result,
      },
      { status }
    );
  }

  return NextResponse.json(
    {
      results: [
        {
          toolCallId,
          result,
        },
      ],
    },
    { status }
  );
}

export async function GET() {
  const user = await getCurrentUserRecord();

  const appointments = await prisma.appointment.findMany({
    where: { ownerUserId: user.id },
    orderBy: { startTime: "asc" },
    include: {
      contact: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  return NextResponse.json(appointments);
}

export async function POST(request: Request) {
  const body = (await request.json()) as AppointmentPayload;

  const toolCalls =
    body.message?.toolCallList ??
    body.message?.toolCalls ??
    body.toolCallList ??
    body.toolCalls ??
    [];

  const firstToolCall = toolCalls[0];
  const toolCallId =
    firstToolCall?.id ?? firstToolCall?.toolCallId ?? body.toolCallId;

  const args = {
    ...readArguments(firstToolCall?.function?.arguments),
    ...readArguments(firstToolCall?.arguments),
    ...readArguments(body),
  };

  const twilioPhone = String(args.twilioPhone ?? body.twilioPhone ?? "").trim();
  const callerPhone = String(args.callerPhone ?? body.callerPhone ?? "").trim();
  const callerName = String(args.callerName ?? body.callerName ?? "").trim();
  const appointmentTitle = String(
    args.appointmentTitle ??
      args.title ??
      body.appointmentTitle ??
      body.title ??
      "Voice AI booking"
  ).trim();
  const startTime = String(args.startTime ?? body.startTime ?? "").trim();
  const notes = String(args.notes ?? body.notes ?? "Booked from Vapi webhook");
  const durationMinutes =
    Number(args.durationMinutes ?? body.durationMinutes ?? 30) || 30;

  const normalizedTwilioPhone = normalizeUsPhone(twilioPhone);
  const normalizedCallerPhone = normalizeUsPhone(callerPhone);

  const isVapiToolCall = Boolean(
    toolCallId ||
      body.message ||
      body.toolCallList ||
      body.toolCalls ||
      twilioPhone ||
      callerPhone
  );

  if (isVapiToolCall) {
    if (!normalizedTwilioPhone || !normalizedCallerPhone || !startTime) {
      return vapiResult(
        toolCallId,
        "Missing or invalid booking data. A valid business phone, caller phone, and appointment time are required.",
        400
      );
    }

    if (!isValidDate(startTime)) {
      return vapiResult(
        toolCallId,
        "Invalid appointment time. Please provide a valid date and time.",
        400
      );
    }

    const appointmentDate = new Date(startTime);

    if (isPastAppointment(appointmentDate)) {
      return vapiResult(
        toolCallId,
        `The requested appointment time resolves to a past date (${formatAppointmentDate(
          appointmentDate
        )}). Ask for a future date and time before booking.`,
        400
      );
    }

    const user = await prisma.user.findFirst({
      where: { twilioPhone: normalizedTwilioPhone },
    });

    if (!user) {
      return vapiResult(
        toolCallId,
        "Business not found for the provided business phone number.",
        404
      );
    }

    let contact = await prisma.contact.findFirst({
      where: { ownerUserId: user.id, phone: normalizedCallerPhone },
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          fullName: callerName || normalizedCallerPhone,
          phone: normalizedCallerPhone,
          notes: "Auto-created from Vapi booking",
          ownerUserId: user.id,
        },
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        title: appointmentTitle,
        contactId: contact.id,
        startTime: appointmentDate,
        durationMinutes,
        type: AppointmentType.PhoneCall,
        notes,
        ownerUserId: user.id,
      },
    });

    await prisma.callLog.create({
      data: {
        callerPhone: normalizedCallerPhone,
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

    return vapiResult(
      toolCallId,
      `Appointment booked successfully for ${contact.fullName}.`
    );
  }

  const user = await getCurrentUserRecord();
  const title = appointmentTitle;

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
