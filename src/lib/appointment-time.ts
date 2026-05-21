export const DEFAULT_BUSINESS_TIMEZONE = "America/Chicago";

export function getBusinessTimeZone(): string {
  return process.env.BUSINESS_TIMEZONE?.trim() || DEFAULT_BUSINESS_TIMEZONE;
}

/**
 * If the AI sends a date without a timezone offset (e.g. "2025-05-01T16:30:00"),
 * Node on UTC servers treats it as UTC wall-clock — so "4:30 PM" becomes 11:30 AM Central.
 * Bare strings are reinterpreted in the business timezone.
 */
export function parseAppointmentDate(
  rawValue: string,
  timeZone = getBusinessTimeZone()
): Date {
  const value = rawValue.trim().replace(/Z$/i, "");

  if (/[+-]\d{2}:?\d{2}$/.test(value)) {
    return new Date(value);
  }

  const bare = new Date(value);
  if (Number.isNaN(bare.getTime())) return bare;

  const tzOffset = getTimezoneOffsetMs(timeZone, bare);
  return new Date(bare.getTime() + tzOffset);
}

export function getTimezoneOffsetMs(timeZone: string, date: Date): number {
  try {
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
      Date.UTC(
        get("year"),
        get("month") - 1,
        get("day"),
        get("hour") % 24,
        get("minute"),
        get("second")
      )
    );
    return date.getTime() - localDate.getTime();
  } catch {
    return 0;
  }
}

export function formatAppointmentDate(
  date: Date,
  timeZone = getBusinessTimeZone()
): string {
  return date.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  });
}
