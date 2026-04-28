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
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    leadTitle: "",
    source: "",
    dealValue: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadTitle: formData.leadTitle,
          source: formData.source || undefined,
          dealValue: formData.dealValue ? parseFloat(formData.dealValue) : undefined,
        }),
      });
      if (response.ok) {
        const newLead = await response.json();
        setLeads((prev) => [newLead, ...prev]);
        setFormData({ leadTitle: "", source: "", dealValue: "" });
        setShowForm(false);
      }
    } catch (error) {
      console.error("Failed to create lead:", error);
    }
  };

  return (
    <AppShell
      title="Leads"
      subtitle={`${leads.length} leads`}
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
          <h2 className="text-sm font-semibold">Add New Lead</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm text-zinc-400">Lead Title *</label>
              <input
                type="text"
                value={formData.leadTitle}
                onChange={(e) => setFormData({ ...formData, leadTitle: e.target.value })}
                className="mt-1 w-full rounded-md border border-white/10 bg-[#161a27] px-3 py-2 text-sm outline-none focus:border-[#4f71e8]"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400">Source</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="mt-1 w-full rounded-md border border-white/10 bg-[#161a27] px-3 py-2 text-sm outline-none focus:border-[#4f71e8]"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400">Deal Value</label>
              <input
                type="number"
                step="0.01"
                value={formData.dealValue}
                onChange={(e) => setFormData({ ...formData, dealValue: e.target.value })}
                className="mt-1 w-full rounded-md border border-white/10 bg-[#161a27] px-3 py-2 text-sm outline-none focus:border-[#4f71e8]"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-md bg-[#355cc9] px-3 py-2 text-sm font-medium text-white hover:bg-[#456ce0]"
              >
                Create Lead
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

      <div className="grid gap-4 xl:grid-cols-3">
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