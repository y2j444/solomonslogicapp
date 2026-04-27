"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell, EmptyState, MetricCard, Surface } from "@/components/app-shell";

type DashboardData = {
  totalContacts: number;
  totalLeads: number;
  totalAppointments: number;
  recentCalls: number;
};

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
      subtitle="Solomon's Logic CRM — Overview"
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
        <MetricCard label="Total Contacts" value={stats?.totalContacts ?? 0} icon="👥" />
        <MetricCard label="Active Leads" value={stats?.totalLeads ?? 0} subvalue="0 won" icon="↗" />
        <MetricCard label="Pipeline Value" value="$1k" icon="$" />
        <MetricCard label="Today's Appointments" value={stats?.totalAppointments ?? 0} icon="📅" />
        <MetricCard label="Upcoming Appointments" value={0} icon="✓" />
        <MetricCard label="Calls (30d)" value={stats?.recentCalls ?? 0} icon="📞" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Surface className="p-5">
          <h2 className="text-[14px] font-semibold">Upcoming Appointments</h2>
          <div className="mt-4">
            <EmptyState
              title="No upcoming appointments"
              description="Bookings will appear here once the receptionist creates them."
            />
          </div>
        </Surface>

        <Surface className="p-5">
          <h2 className="text-[14px] font-semibold">Recent Calls</h2>
          <div className="mt-4">
            <EmptyState
              title="No recent calls"
              description="Inbound and outbound call activity will populate here."
            />
          </div>
        </Surface>
      </div>
    </AppShell>
  );
}
