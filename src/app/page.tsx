"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell, EmptyState, MetricCard, Surface } from "@/components/app-shell";

type AppointmentItem = {
  id: string;
  title: string;
  startTime: string;
  durationMinutes: number;
  status: string;
  contact: {
    id: string;
    fullName: string;
  } | null;
};

type CallItem = {
  id: string;
  callerPhone: string;
  direction: string;
  durationSeconds: number;
  calledAt: string;
  contact: {
    id: string;
    fullName: string;
  } | null;
};

type DashboardData = {
  totalContacts: number;
  totalLeads: number;
  totalAppointments: number;
  upcomingAppointmentsCount: number;
  recentCalls: number;
  upcomingAppointments: AppointmentItem[];
  recentCallItems: CallItem[];
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardData | null>(null);

  useEffect(() => {
    void fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  return (
    <AppShell
      title="Dashboard"
      subtitle="Solomon's Logic CRM Overview"
      action={
        <Link
          href="/ai-receptionist"
          className="rounded-md bg-[#355cc9] px-3 py-2 text-sm font-medium text-white hover:bg-[#456ce0]"
        >
          AI Receptionist
        </Link>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <MetricCard label="Total Contacts" value={stats?.totalContacts ?? 0} icon="C" />
        <MetricCard label="Active Leads" value={stats?.totalLeads ?? 0} subvalue="0 won" icon="L" />
        <MetricCard label="Pipeline Value" value="$1k" icon="$" />
        <MetricCard label="Today's Appointments" value={stats?.totalAppointments ?? 0} icon="A" />
        <MetricCard
          label="Upcoming Appointments"
          value={stats?.upcomingAppointmentsCount ?? 0}
          icon="U"
        />
        <MetricCard label="Calls (30d)" value={stats?.recentCalls ?? 0} icon="P" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Surface className="overflow-hidden">
          <div className="border-b border-white/5 px-5 py-4">
            <h2 className="text-[14px] font-semibold">Upcoming Appointments</h2>
          </div>
          {stats?.upcomingAppointments.length ? (
            <div className="divide-y divide-white/5">
              {stats.upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-start justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-100">
                      {appointment.title}
                    </div>
                    <div className="mt-1 text-xs text-zinc-400">
                      {appointment.contact?.fullName ?? "Unassigned contact"}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-medium text-zinc-100">
                      {formatDateTime(appointment.startTime)}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {appointment.durationMinutes} min
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5">
              <EmptyState
                title="No upcoming appointments"
                description="Bookings will appear here once the receptionist creates them."
              />
            </div>
          )}
        </Surface>

        <Surface className="overflow-hidden">
          <div className="border-b border-white/5 px-5 py-4">
            <h2 className="text-[14px] font-semibold">Recent Calls</h2>
          </div>
          {stats?.recentCallItems.length ? (
            <div className="divide-y divide-white/5">
              {stats.recentCallItems.map((call) => (
                <div key={call.id} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-100">
                      {call.contact?.fullName ?? call.callerPhone}
                    </div>
                    <div className="mt-1 text-xs text-zinc-400">
                      {call.direction} call
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-medium text-zinc-100">
                      {formatDuration(call.durationSeconds)}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {formatDateTime(call.calledAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5">
              <EmptyState
                title="No recent calls"
                description="Inbound and outbound call activity will populate here."
              />
            </div>
          )}
        </Surface>
      </div>
    </AppShell>
  );
}
