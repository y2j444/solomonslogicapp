"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, Event, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { AppShell, Surface } from "@/components/app-shell";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type Appointment = {
  id: string;
  title: string;
  startTime: string | Date;
  status: string;
  contactId: string | null;
  durationMinutes: number;
  notes: string | null;
  contact: {
    id: string;
    fullName: string;
  } | null;
};

type CalendarEvent = Event & {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  status: string;
  contactId?: string;
  contactName?: string;
  notes?: string;
};

function getEventBackground(status: string) {
  switch (status) {
    case "Completed":
      return "#0f9f6e";
    case "Cancelled":
      return "#c2410c";
    case "NoShow":
      return "#7c3aed";
    default:
      return "#355cc9";
  }
}

const eventStyleGetter = (event: Event) => {
  const typedEvent = event as CalendarEvent;
  const backgroundColor = getEventBackground(typedEvent.status ?? "Scheduled");
  return {
    style: {
      backgroundColor,
      borderRadius: "6px",
      opacity: 0.95,
      color: "#fff",
      border: "none",
      display: "block",
      padding: "2px 6px",
    },
  };
};

function CalendarEventCard({ event }: { event: CalendarEvent }) {
  const description = event.notes?.trim();

  return (
    <div className="flex min-w-0 flex-col leading-tight">
      <span className="truncate text-[11px] font-semibold text-white">
        {event.title}
      </span>
      {event.contactName ? (
        <span className="truncate text-[10px] text-blue-100">{event.contactName}</span>
      ) : null}
      {description ? (
        <span className="truncate text-[10px] text-zinc-200/90">{description}</span>
      ) : null}
    </div>
  );
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<View>("month");

  useEffect(() => {
    void fetch("/api/appointments")
      .then((r) => r.json())
      .then(setAppointments)
      .catch(() => setAppointments([]));
  }, []);

  const events = useMemo<CalendarEvent[]>(() => {
    return appointments.map((appointment) => {
      const start = new Date(appointment.startTime);
      const end = new Date(
        start.getTime() + Math.max(appointment.durationMinutes, 15) * 60_000
      );
      const contactName = appointment.contact?.fullName ?? null;
      const description = appointment.notes?.trim() || null;

      return {
        id: appointment.id,
        title: appointment.title,
        start,
        end,
        allDay: false,
        status: appointment.status,
        contactId: appointment.contactId ?? undefined,
        contactName: contactName ?? undefined,
        notes: description ?? undefined,
      };
    });
  }, [appointments]);

  return (
    <AppShell title="Appointments" subtitle={`${appointments.length} appointments`}>
      <Surface className="p-4">
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            step={60}
            timeslots={1}
            titleAccessor={(event) => {
              const typedEvent = event as CalendarEvent;
              return [
                typedEvent.title,
                typedEvent.contactName,
                typedEvent.notes,
              ]
                .filter(Boolean)
                .join(" | ");
            }}
            tooltipAccessor={(event) => {
              const typedEvent = event as CalendarEvent;
              const details = [
                typedEvent.title,
                typedEvent.contactName ? `Contact: ${typedEvent.contactName}` : null,
                typedEvent.notes ? `Description: ${typedEvent.notes}` : null,
                `${format(typedEvent.start, "p")} - ${format(typedEvent.end, "p")}`,
              ].filter(Boolean);

              return details.join("\n");
            }}
            style={{ height: "100%" }}
            date={date}
            view={view}
            onNavigate={(nextDate) => setDate(nextDate)}
            onView={(newView) => setView(newView)}
            eventPropGetter={eventStyleGetter}
            components={{
              event: CalendarEventCard,
            }}
            messages={{
              date: "Date",
              time: "Time",
              event: "Event",
              showMore: (count) => `+${count} more`,
            }}
            className="rbc-dark-theme"
          />
        </div>
      </Surface>

      <style jsx global>{`
        /* Dark theme overrides for react-big-calendar */
        .rbc-dark-theme {
          color: #e5e7eb;
        }

        .rbc-dark-theme .rbc-header {
          color: #9ca3af;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .rbc-dark-theme .rbc-today {
          background-color: rgba(53, 92, 201, 0.15);
        }

        .rbc-dark-theme .rbc-off-range-bg {
          background: rgba(22, 26, 39, 0.5);
        }

        .rbc-dark-theme .rbc-date-cell {
          color: #e5e7eb;
        }

        .rbc-dark-theme .rbc-date-cell.rbc-now {
          color: #355cc9;
          font-weight: bold;
        }

        .rbc-dark-theme .rbc-time-view {
          border-color: rgba(255, 255, 255, 0.1);
        }

        .rbc-dark-theme .rbc-time-slot {
          color: #9ca3af;
        }

        .rbc-dark-theme .rbc-current-time-indicator {
          background-color: #ef4444;
        }

        .rbc-dark-theme .rbc-toolbar {
          color: #e5e7eb;
        }

        .rbc-dark-theme .rbc-toolbar button {
          color: #e5e7eb;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .rbc-dark-theme .rbc-toolbar button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .rbc-dark-theme .rbc-toolbar button.rbc-active {
          background: #355cc9;
          color: #fff;
        }

        .rbc-dark-theme .rbc-day-bg {
          border-left-color: rgba(255, 255, 255, 0.05);
        }

        .rbc-dark-theme .rbc-month-row {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .rbc-dark-theme .rbc-month-row + .rbc-month-row {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .rbc-dark-theme .rbc-month-view {
          min-height: 540px;
        }

        .rbc-dark-theme .rbc-month-header {
          flex: 0 0 auto;
        }

        .rbc-dark-theme .rbc-month-row {
          min-height: 96px;
          flex: 1 0 96px;
          height: auto;
        }

        .rbc-dark-theme .rbc-row-bg,
        .rbc-dark-theme .rbc-row-content {
          min-height: 100%;
        }

        .rbc-dark-theme .rbc-date-cell > a,
        .rbc-dark-theme .rbc-date-cell > button {
          display: inline-block;
          padding-top: 4px;
          color: inherit;
        }

        .rbc-dark-theme .rbc-event {
          background: #355cc9;
          border: none;
          min-height: 24px;
        }

        .rbc-dark-theme .rbc-event:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(53, 92, 201, 0.5);
        }

        .rbc-dark-theme .rbc-event.rbc-selected {
          background: #456ce0;
        }

        .rbc-dark-theme .rbc-show-more {
          color: #9fb4ff;
        }

        .rbc-dark-theme .rbc-toolbar-label {
          color: #e5e7eb;
        }

        .rbc-dark-theme .rbc-event-content {
          white-space: normal;
        }

        .rbc-dark-theme .rbc-row-segment {
          padding: 0 2px 2px;
        }

        .rbc-dark-theme .rbc-month-view .rbc-event {
          min-height: 44px;
          padding-top: 4px;
          padding-bottom: 4px;
        }

        .rbc-dark-theme .rbc-day-slot .rbc-event {
          min-height: 52px;
        }

        .rbc-dark-theme .rbc-agenda-view table.rbc-agenda-table {
          background: transparent;
        }

        .rbc-dark-theme .rbc-time-header-content {
          border-left-color: rgba(255, 255, 255, 0.1);
        }

        .rbc-dark-theme .rbc-time-content {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .rbc-dark-theme .rbc-timeslot-group {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .rbc-dark-theme .rbc-event-label {
          color: #cbd5e1;
        }

        .rbc-dark-theme .rbc-agenda-view .rbc-agenda-event-cell,
        .rbc-dark-theme .rbc-agenda-view .rbc-agenda-time-cell,
        .rbc-dark-theme .rbc-agenda-view .rbc-agenda-date-cell {
          color: #e5e7eb;
          border-color: rgba(255, 255, 255, 0.08);
        }

        .rbc-dark-theme .rbc-agenda-view .rbc-agenda-content {
          background: rgba(17, 19, 27, 0.5);
        }

        .rbc-dark-theme .rbc-day-bg + .rbc-day-bg,
        .rbc-dark-theme .rbc-month-row + .rbc-month-row,
        .rbc-dark-theme .rbc-header + .rbc-header {
          border-left-color: rgba(255, 255, 255, 0.05);
        }

        .rbc-dark-theme .rbc-date-cell {
          padding-right: 6px;
        }

        .rbc-dark-theme .rbc-current-time-indicator {
          z-index: 3;
        }
      `}</style>
    </AppShell>
  );
}
