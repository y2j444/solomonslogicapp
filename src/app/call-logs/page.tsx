"use client";

import { useEffect, useState } from "react";
import { AppShell, EmptyState, Surface } from "@/components/app-shell";

type CallLog = {
  id: string;
  callerPhone: string;
  direction: string;
  durationSeconds: number;
  calledAt?: string;
};

export default function CallLogsPage() {
  const [logs, setLogs] = useState<CallLog[]>([]);

  useEffect(() => {
    void fetch("/api/call-logs")
      .then((r) => r.json())
      .then(setLogs)
      .catch(() => setLogs([]));
  }, []);

  return (
    <AppShell title="Call Logs" subtitle={`${logs.length} logged calls`}>
      <Surface className="overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No calls yet."
              description="Inbound/outbound call records will show up here."
            />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between px-4 py-4">
                <div>
                  <div className="text-sm font-semibold">{log.callerPhone}</div>
                  <div className="mt-1 text-xs text-zinc-500">{log.direction}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{log.durationSeconds}s</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {log.calledAt ? new Date(log.calledAt).toLocaleString() : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Surface>
    </AppShell>
  );
}