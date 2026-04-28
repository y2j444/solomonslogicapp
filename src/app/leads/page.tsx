"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell, EmptyState, Surface } from "@/components/app-shell";
import { LeadModal } from "@/components/lead-modal";

type Lead = {
  id: string;
  leadTitle: string;
  stage: string;
  dealValue: number;
  source: string | null;
  notes?: string | null;
};

type LeadPayload = {
  id?: string;
  leadTitle: string;
  stage?: string;
  source?: string;
  dealValue?: number;
  notes?: string;
};

const stageOrder = ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/leads")
      .then((r) => r.json())
      .then(setLeads)
      .catch(() => setLeads([]))
      .finally(() => setIsLoading(false));
  }, []);

  const grouped = useMemo(() => {
    return stageOrder.map((stage) => ({
      stage,
      items: leads.filter((lead) => lead.stage === stage),
    }));
  }, [leads]);

  const handleSaveLead = async (lead: LeadPayload) => {
    const response = await fetch("/api/leads", {
      method: lead.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: lead.id,
        leadTitle: lead.leadTitle.trim(),
        stage: lead.stage,
        source: lead.source?.trim() || null,
        dealValue: lead.dealValue ?? 0,
        notes: lead.notes?.trim() || null,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save lead");
    }

    const updated = await response.json();
    if (lead.id) {
      setLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? updated : l))
      );
    } else {
      setLeads((prev) => [updated, ...prev]);
    }
    setSelectedLead(null);
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    setIsDeleting(id);
    try {
      const response = await fetch(`/api/leads?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete lead");
      }

      setLeads((prev) => prev.filter((l) => l.id !== id));
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  return (
    <AppShell
      title="Leads"
      subtitle={`${leads.length} leads`}
      action={
        <button
          onClick={handleAddNew}
          className="rounded-md bg-[#355cc9] px-3 py-2 text-sm font-medium text-white hover:bg-[#456ce0]"
        >
          + New Lead
        </button>
      }
    >
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
                    <div>
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
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleEditLead(lead)}
                        className="flex-1 rounded-md bg-white/5 px-2 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        disabled={isDeleting === lead.id}
                        className="flex-1 rounded-md bg-red-500/10 px-2 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                      >
                        {isDeleting === lead.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Surface>
        ))}
      </div>

      <LeadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLead(null);
        }}
        onSave={handleSaveLead}
        initialLead={selectedLead}
      />
    </AppShell>
  );
}