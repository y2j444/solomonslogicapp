"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, Event, View } from "react-big-calendar";
import withDragAndDrop, { withDragAndDropProps } from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { AppShell, Surface } from "@/components/app-shell";
import { Modal } from "@/components/modal";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const DnDCalendar = withDragAndDrop(Calendar);

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

type Contact = {
  id: string;
  fullName: string;
};

type Appointment = {
  id: string;
  title: string;
  startTime: string | Date;
  status: string;
  type: string;
  contactId: string | null;
  durationMinutes: number;
  notes: string | null;
  contact: Contact | null;
};

type CalendarEvent = Event & {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  status: string;
  type: string;
  contactId?: string;
  contactName?: string;
  notes?: string;
};

const toLocalISOString = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

function getEventBackground(status: string, type: string) {
  if (type === "Blocked") return "#4b5563";

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
  const backgroundColor = getEventBackground(typedEvent.status, typedEvent.type);
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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<View>("month");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    contactId: "",
    startTime: "",
    durationMinutes: 30,
    type: "PhoneCall",
    status: "Scheduled",
    notes: "",
  });

  const fetchAppointments = useCallback(() => {
    void fetch("/api/appointments")
      .then((r) => r.json())
      .then(setAppointments)
      .catch(() => setAppointments([]));
  }, []);

  useEffect(() => {
    fetchAppointments();
    void fetch("/api/contacts")
      .then((r) => r.json())
      .then(setContacts)
      .catch(() => setContacts([]));
  }, [fetchAppointments]);

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
        type: appointment.type,
        contactId: appointment.contactId ?? undefined,
        contactName: contactName ?? undefined,
        notes: description ?? undefined,
      };
    });
  }, [appointments]);

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo);
    setSelectedEvent(null);
    setFormData({
      title: "",
      contactId: "",
      startTime: toLocalISOString(slotInfo.start),
      durationMinutes: 30,
      type: "PhoneCall",
      status: "Scheduled",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event: Event) => {
    const e = event as CalendarEvent;
    setSelectedEvent(e);
    setSelectedSlot(null);
    setFormData({
      title: e.title,
      contactId: e.contactId ?? "",
      startTime: toLocalISOString(e.start),
      durationMinutes: Math.round((e.end.getTime() - e.start.getTime()) / 60000),
      type: e.type,
      status: e.status,
      notes: e.notes ?? "",
    });
    setIsModalOpen(true);
  };

  const moveEvent = async ({
    event,
    start,
    end,
    isAllDay: droppedOnAllDaySlot,
  }: any) => {
    const { id } = event as CalendarEvent;
    const durationMinutes = Math.round(
      (new Date(end).getTime() - new Date(start).getTime()) / 60000
    );

    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startTime: new Date(start).toISOString(),
        durationMinutes,
      }),
    });

    if (res.ok) {
      fetchAppointments();
    } else {
      alert("Failed to move appointment");
    }
  };

  const resizeEvent = async ({ event, start, end }: any) => {
    const { id } = event as CalendarEvent;
    const durationMinutes = Math.round(
      (new Date(end).getTime() - new Date(start).getTime()) / 60000
    );

    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startTime: new Date(start).toISOString(),
        durationMinutes,
      }),
    });

    if (res.ok) {
      fetchAppointments();
    } else {
      alert("Failed to resize appointment");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    
    setIsSaving(true);
    const url = selectedEvent ? `/api/appointments/${selectedEvent.id}` : "/api/appointments";
    const method = selectedEvent ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchAppointments();
      } else {
        alert("Failed to save appointment");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    if (!confirm("Are you sure you want to delete this appointment?")) return;

    const res = await fetch(`/api/appointments/${selectedEvent.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setIsModalOpen(false);
      fetchAppointments();
    } else {
      alert("Failed to delete appointment");
    }
  };

  return (
    <AppShell title="Appointments" subtitle={`${appointments.length} appointments`}>
      <style jsx global>{`
        .rbc-calendar {
          background: #1b1e2e;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 10px;
        }
        .rbc-timeslot-group {
          border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important;
          min-height: 90px !important;
          background: transparent !important;
        }
        .rbc-day-slot .rbc-time-slot {
          border-top: 1px dashed rgba(255, 255, 255, 0.05) !important;
        }
        .rbc-time-view {
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          border-radius: 8px;
        }
        .rbc-header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          padding: 10px 0 !important;
          font-weight: 600 !important;
          color: #a1a1aa !important;
        }
        .rbc-time-header-content {
          border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .rbc-current-time-indicator {
          background-color: #ef4444 !important;
        }
      `}</style>
      <DndProvider backend={HTML5Backend}>
        <Surface className="p-4">
          <div className="h-[700px]">
            <DnDCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              step={30}
              timeslots={2}
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              onEventDrop={moveEvent}
              onEventResize={resizeEvent}
              resizable
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
    </DndProvider>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEvent ? "Edit Appointment" : "Create Appointment"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400">Title</label>
            <input
              type="text"
              required
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={formData.type === "Blocked" ? "e.g. Out of Office" : "Meeting with Client"}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400">Type</label>
              <select
                className="mt-1 w-full rounded-md border border-white/10 bg-[#1b1e2e] px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="PhoneCall" className="bg-[#1b1e2e] text-zinc-100">Phone Call</option>
                <option value="Meeting" className="bg-[#1b1e2e] text-zinc-100">Meeting</option>
                <option value="Demo" className="bg-[#1b1e2e] text-zinc-100">Demo</option>
                <option value="FollowUp" className="bg-[#1b1e2e] text-zinc-100">Follow Up</option>
                <option value="Blocked" className="bg-[#1b1e2e] text-zinc-100">Blocked / Busy</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400">Status</label>
              <select
                className="mt-1 w-full rounded-md border border-white/10 bg-[#1b1e2e] px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Scheduled" className="bg-[#1b1e2e] text-zinc-100">Scheduled</option>
                <option value="Completed" className="bg-[#1b1e2e] text-zinc-100">Completed</option>
                <option value="Cancelled" className="bg-[#1b1e2e] text-zinc-100">Cancelled</option>
                <option value="NoShow" className="bg-[#1b1e2e] text-zinc-100">No Show</option>
              </select>
            </div>
          </div>

          {formData.type !== "Blocked" && (
            <div>
              <label className="block text-xs font-medium text-zinc-400">Contact</label>
              <select
                className="mt-1 w-full rounded-md border border-white/10 bg-[#1b1e2e] px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                value={formData.contactId}
                onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
              >
                <option value="" className="bg-[#1b1e2e] text-zinc-100">No contact</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#1b1e2e] text-zinc-100">
                    {c.fullName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400">Start Time</label>
              <input
                type="datetime-local"
                required
                className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400">Duration (min)</label>
              <input
                type="number"
                required
                min="5"
                step="5"
                className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400">Notes</label>
            <textarea
              className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            {selectedEvent ? (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-md bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20"
              >
                Delete
              </button>
            ) : (
              <div />
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-md border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : (selectedEvent ? "Update" : "Create")}
              </button>
            </div>
          </div>
        </form>
      </Modal>

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
