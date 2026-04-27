"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell, EmptyState, Surface } from "@/components/app-shell";

type Lead = {
  id: string;
  leadTitle: string;
  stage: string;
  dealValue: number;
  source: string | null;
};

const stageOrder = ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    void fetch("/api/leads")
      .then((r) => r.json())
      .then(setLeads)
      .catch(() => setLeads([]));
  }, []);

  const grouped = useMemo(() => {
    return stageOrder.map((stage) => ({
      stage,
      items: leads.filter((lead) => lead.stage === stage),
    }));
  }, [leads]);

  return (
    <AppShell title="Leads" subtitle={`${leads.length} leads`}>
      <div className="grid gap-4 xl:grid-cols-3">
        {grouped.map((group) => (
          <Surface key={group.stage} className="p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-semibold">{group.stage}</h2>
              <span className="text-xs text-zinc-500">{group.items.length}</span>
            </div>

            <div className="mt-4 space-y-3">
              {group.items.length === 0 ? (
                <EmptyState
                  title="Nothing here"
                  description="This stage is currently empty."
                />
              ) : (
                group.items.map((lead) => (
                  <div key={lead.id} className="rounded-lg bg-[#262942] p-4">
                    <div className="text-sm font-semibold">{lead.leadTitle}</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {lead.source ?? "Unknown source"}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-zinc-400">
                        ${Number(lead.dealValue).toFixed(2)}
                      </span>
                      <span className="rounded-full bg-white/5 px-2 py-1 text-zinc-300">
                        {lead.stage}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Surface>
        ))}
      </div>
    </AppShell>
  );
}