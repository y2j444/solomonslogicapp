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

type VapiMessage = {
  toolCallList?: VapiToolCall[];
  toolCalls?: VapiToolCall[];
  // The phone number the call came in on (the business's Vapi number)
  phoneNumber?: {
    number?: string;
  };
  // The caller's phone number
  customer?: {
    number?: string;
    name?: string;
  };
  call?: {
    customer?: {
      number?: string;
      name?: string;
    };
  };
};

type AppointmentPayload = {
  message?: VapiMessage;
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

/**
 * If the AI sends a date without a timezone offset (e.g. "2025-05-01T10:00:00"),
 * JavaScript treats it as UTC which can make "tomorrow 10am CST" look like the past.
 * We detect bare local-looking strings and re-interpret them in the business timezone.
 */
function parseAppointmentDate(value: string, timeZone = "America/Chicago"): Date {
  // Already has timezone info — trust it directly
  if (/Z$|[+-]\d{2}:?\d{2}$/.test(value.trim())) {
    return new Date(value);
  }

  // Bare ISO-like string — reinterpret in business timezone
  try {
    const { Temporal } = Intl as unknown as { Temporal?: unknown };
    void Temporal; // only here if available; fall through otherwise
  } catch { /* ignore */ }

  // Use Intl.DateTimeFormat trick to shift bare date into the correct timezone
  const bare = new Date(value);
  if (Number.isNaN(bare.getTime())) return bare; // let caller handle NaN

  // Re-express the bare date as if it were local time in the target timezone
  const utcMs = bare.getTime();
  const tzOffset = getTimezoneOffsetMs(timeZone, bare);
  return new Date(utcMs + tzOffset);
}

function getTimezoneOffsetMs(timeZone: string, date: Date): number {
  try {
    // Get what UTC time corresponds to the given wall-clock in the target zone
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(date);

    const get = (type: string) =>
      parseInt(parts.find((p) => p.type === type)?.value ?? "0", 10);

    const localDate = new Date(
      Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"), get("second"))
    );
    return date.getTime() - localDate.getTime();
  } catch {
    return 0;
  }
}

function isPastAppointment(date: Date) {
  // Use a 2-hour grace window to account for timezone ambiguity in natural language dates
  const graceMs = 2 * 60 * 60 * 1000;
  return date.getTime() < Date.now() - graceMs;
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

  // DEBUG: log full Vapi payload so we can see exactly what's being sent
  console.log("[appointments] RAW BODY:", JSON.stringify(body, null, 2));

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

  // Business phone: prefer what Vapi sends in the call payload (the number the caller dialed)
  // so the AI never needs to ask the caller for it.
  const businessPhoneFromPayload =
    body.message?.phoneNumber?.number ?? "";

  // Caller phone: Vapi sends this in message.customer.number
  const callerPhoneFromPayload =
    body.message?.customer?.number ??
    body.message?.call?.customer?.number ??
    "";

  const callerNameFromPayload =
    body.message?.customer?.name ??
    body.message?.call?.customer?.name ??
    "";

  // Business phone: ALWAYS use what Vapi sends in the payload — never trust the AI's args for this.
  const twilioPhone = businessPhoneFromPayload || String(body.twilioPhone ?? "").trim();
  // Caller name: prefer AI args (spoken), fall back to Vapi payload
  const callerName = (String(args.callerName ?? "").trim() || String(body.callerName ?? "").trim() || callerNameFromPayload);
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
  // Normalize each caller phone candidate independently; take first valid result.
  // This handles the AI sending just "+1" (country code only) which would normalize to "".
  const normalizedCallerPhone =
    normalizeUsPhone(String(args.callerPhone ?? "").trim()) ||
    normalizeUsPhone(String(body.callerPhone ?? "").trim()) ||
    normalizeUsPhone(callerPhoneFromPayload);

  const isVapiToolCall = Boolean(
    toolCallId ||
      body.message ||
      body.toolCallList ||
      body.toolCalls ||
      twilioPhone ||
      callerPhone
  );

  if (isVapiToolCall) {
    console.log("[appointments] EXTRACTED:", {
      twilioPhone,
      callerPhone,
      callerName,
      startTime,
      normalizedTwilioPhone,
      normalizedCallerPhone,
    });

    if (!normalizedCallerPhone || !startTime) {
      return vapiResult(
        toolCallId,
        "Missing booking data. A caller phone number and appointment time are required.",
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

    const appointmentDate = parseAppointmentDate(startTime);

    // Server-side date sanity check: if the AI booked "today" but the caller said "tomorrow",
    // the AI often sends today's date. If the booked time is today and within 8 hours from now,
    // bump it forward 1 day. This is a safe heuristic for a voice booking context.
    const eightHoursMs = 8 * 60 * 60 * 1000;
    const msUntilAppointment = appointmentDate.getTime() - Date.now();
    const isWithin8HoursFromNow = msUntilAppointment >= 0 && msUntilAppointment < eightHoursMs;
    const correctedDate = isWithin8HoursFromNow
      ? new Date(appointmentDate.getTime() + 24 * 60 * 60 * 1000)
      : appointmentDate;

    console.log("[appointments] PARSED DATE:", {
      raw: startTime,
      parsed: appointmentDate.toISOString(),
      corrected: correctedDate.toISOString(),
      now: new Date().toISOString(),
      bumpedByOneDay: isWithin8HoursFromNow,
      isPast: isPastAppointment(correctedDate),
    });

    if (isPastAppointment(correctedDate)) {
      return vapiResult(
        toolCallId,
        `The requested appointment time resolves to a past date (${formatAppointmentDate(
          correctedDate
        )}). Please confirm the date with the caller and try a future date and time.`,
        400
      );
    }

    // Look up business by phone number. If we have it from the payload, use it;
    // otherwise fall back to finding by caller phone (for single-tenant setups).
    let user = normalizedTwilioPhone
      ? await prisma.user.findFirst({ where: { twilioPhone: normalizedTwilioPhone } })
      : null;

    if (!user) {
      // Fallback: if there's only one user in the system, use them
      const allUsers = await prisma.user.findMany({ take: 2 });
      if (allUsers.length === 1) {
        user = allUsers[0];
      } else {
        return vapiResult(
          toolCallId,
          "Could not identify the business account for this call. Please contact support.",
          404
        );
      }
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
        startTime: correctedDate,
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
