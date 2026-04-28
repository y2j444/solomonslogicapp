"use client";

import { useEffect, useState } from "react";
import { AppShell, EmptyState, Surface } from "@/components/app-shell";

type Appointment = {
  id: string;
  title: string;
  startTime: string;
  status: string;
};

function Calendar({ appointments }: { appointments: Appointment[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

  const days = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const appointmentsByDate = appointments.reduce((acc, app) => {
    const date = new Date(app.startTime).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(app);
    return acc;
  }, {} as Record<string, Appointment[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="rounded-md bg-white/5 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10"
        >
          ‹
        </button>
        <h3 className="text-sm font-semibold">
          {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <button
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="rounded-md bg-white/5 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-2 text-center text-xs font-medium text-zinc-400">
            {day}
          </div>
        ))}
        {days.map((day) => {
          const dateStr = day.toDateString();
          const dayAppointments = appointmentsByDate[dateStr] || [];
          const isCurrentMonth = day.getMonth() === month;
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[80px] border border-white/5 p-1 ${
                isCurrentMonth ? "bg-[#1b1e2e]" : "bg-[#161a27]/50"
              } ${isToday ? "border-[#4f71e8]" : ""}`}
            >
              <div className="text-xs text-zinc-400 mb-1">{day.getDate()}</div>
              <div className="space-y-1">
                {dayAppointments.slice(0, 2).map((app) => (
                  <div
                    key={app.id}
                    className="rounded bg-[#355cc9]/20 px-1 py-0.5 text-[10px] text-[#9fb4ff] truncate"
                    title={app.title}
                  >
                    {app.title}
                  </div>
                ))}
                {dayAppointments.length > 2 && (
                  <div className="text-[10px] text-zinc-500">
                    +{dayAppointments.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    startTime: "",
    durationMinutes: "30",
    notes: "",
  });

  useEffect(() => {
    void fetch("/api/appointments")
      .then((r) => r.json())
      .then(setAppointments)
      .catch(() => setAppointments([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          startTime: formData.startTime,
          durationMinutes: parseInt(formData.durationMinutes),
          notes: formData.notes || undefined,
        }),
      });
      if (response.ok) {
        const newAppointment = await response.json();
        setAppointments((prev) => [newAppointment, ...prev]);
        setFormData({ title: "", startTime: "", durationMinutes: "30", notes: "" });
        setShowForm(false);
      }
    } catch (error) {
      console.error("Failed to create appointment:", error);
    }
  };

  return (
    <AppShell
      title="Appointments"
      subtitle={`${appointments.length} appointments`}
      action={
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md bg-[#355cc9] px-3 py-2 text-sm font-medium text-white hover:bg-[#456ce0]"
        >
          +
        </button>
      }
    >
      {showForm && (
        <Surface className="mb-4 p-5">
          <h2 className="text-sm font-semibold">Schedule New Appointment</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm text-zinc-400">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 w-full rounded-md border border-white/10 bg-[#161a27] px-3 py-2 text-sm outline-none focus:border-[#4f71e8]"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400">Start Time *</label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="mt-1 w-full rounded-md border border-white/10 bg-[#161a27] px-3 py-2 text-sm outline-none focus:border-[#4f71e8]"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400">Duration (minutes)</label>
              <input
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                className="mt-1 w-full rounded-md border border-white/10 bg-[#161a27] px-3 py-2 text-sm outline-none focus:border-[#4f71e8]"
                min="15"
                max="480"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1 w-full rounded-md border border-white/10 bg-[#161a27] px-3 py-2 text-sm outline-none focus:border-[#4f71e8]"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-md bg-[#355cc9] px-3 py-2 text-sm font-medium text-white hover:bg-[#456ce0]"
              >
                Schedule Appointment
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md bg-white/5 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </form>
        </Surface>
      )}

      <Surface className="overflow-hidden">
      <Surface className="overflow-hidden">
        <div className="p-4">
          <h2 className="text-sm font-semibold mb-4">Calendar View</h2>
          <Calendar appointments={appointments} />
        </div>
      </Surface>
    </AppShell>
  );
}