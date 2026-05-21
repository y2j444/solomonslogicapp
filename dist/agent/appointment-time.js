// src/lib/appointment-time.ts
var DEFAULT_BUSINESS_TIMEZONE = "America/Chicago";
function getBusinessTimeZone() {
  return process.env.BUSINESS_TIMEZONE?.trim() || DEFAULT_BUSINESS_TIMEZONE;
}
function parseAppointmentDate(rawValue, timeZone = getBusinessTimeZone()) {
  const value = rawValue.trim().replace(/Z$/i, "");
  if (/[+-]\d{2}:?\d{2}$/.test(value)) {
    return new Date(value);
  }
  const bare = new Date(value);
  if (Number.isNaN(bare.getTime())) return bare;
  const tzOffset = getTimezoneOffsetMs(timeZone, bare);
  return new Date(bare.getTime() + tzOffset);
}
function getTimezoneOffsetMs(timeZone, date) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).formatToParts(date);
    const get = (type) => parseInt(parts.find((p) => p.type === type)?.value ?? "0", 10);
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
function formatAppointmentDate(date, timeZone = getBusinessTimeZone()) {
  return date.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short"
  });
}
export {
  DEFAULT_BUSINESS_TIMEZONE,
  formatAppointmentDate,
  getBusinessTimeZone,
  parseAppointmentDate
};
//# sourceMappingURL=appointment-time.js.map
