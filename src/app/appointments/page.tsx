"use client";

import { useEffect, useState } from "react";
import { AppShell, EmptyState, Surface } from "@/components/app-shell";

type Appointment = {
  id: string;
  title: string;
  startTime: string;
  status: string;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    void fetch("/api/appointments")
      .then((r) => r.json())
      .then(setAppointments)
      .catch(() => setAppointments([]));
  }, []);

  return (
    <AppShell title="Appointments" subtitle={`${appointments.length} appointments`}>
      <Surface className="overflow-hidden">
        {appointments.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No appointments yet."
              description="Booked calls and meetings will appear here."
            />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between px-4 py-4">
                <div>
                  <div className="text-sm font-semibold">{appointment.title}</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {new Date(appointment.startTime).toLocaleString()}
                  </div>
                </div>
                <div className="rounded-full bg-[#355cc9]/15 px-2 py-1 text-[11px] text-[#9fb4ff]">
                  {appointment.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </Surface>
    </AppShell>
  );
}