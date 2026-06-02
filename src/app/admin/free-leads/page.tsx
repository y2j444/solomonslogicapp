"use client";

import { useEffect, useState } from "react";
import { AppShell, Surface } from "@/components/app-shell";

type Lead = {
  business: string;
  industry: string;
  email: string;
  phone?: string;
  website?: string;
  status: "scraped" | "sent" | "replied" | "converted";
  sentAt?: string;
};

const STATUS_CONFIG = {
  scraped: { label: "Scraped", color: "bg-zinc-500/20 text-zinc-400" },
  sent: { label: "Email Sent", color: "bg-blue-500/20 text-blue-400" },
  replied: { label: "Replied ✉", color: "bg-amber-500/20 text-amber-400" },
  converted: { label: "Converted 🎉", color: "bg-emerald-500/20 text-emerald-400" },
};

function StatusBadge({ status }: { status: Lead["status"] }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.scraped;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

export default function FreeLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Lead["status"]>("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/free-leads")
      .then((r) => r.json())
      .then((data) => { setLeads(data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSendEmail = async (lead: Lead) => {
    setSending(lead.email);
    try {
      const res = await fetch("/api/admin/free-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: lead.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => l.email === lead.email ? { ...l, status: "sent", sentAt: new Date().toISOString() } : l)
        );
        showToast(`✅ Pitch sent to ${lead.business}!`);
      } else {
        showToast(`❌ Failed: ${data.error}`);
      }
    } catch {
      showToast("❌ Network error");
    } finally {
      setSending(null);
    }
  };

  const handleStatusChange = async (lead: Lead, newStatus: Lead["status"]) => {
    const res = await fetch("/api/admin/free-leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: lead.email, status: newStatus }),
    });
    if (res.ok) {
      setLeads((prev) => prev.map((l) => l.email === lead.email ? { ...l, status: newStatus } : l));
    }
  };

  const filtered = leads.filter((l) => {
    const matchesFilter = filter === "all" || l.status === filter;
    const q = search.toLowerCase();
    const matchesSearch = !q || l.business.toLowerCase().includes(q) || l.industry.toLowerCase().includes(q) || l.email.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: leads.length,
    sent: leads.filter((l) => l.status === "sent" || l.status === "replied" || l.status === "converted").length,
    replied: leads.filter((l) => l.status === "replied").length,
    converted: leads.filter((l) => l.status === "converted").length,
  };

  if (isLoading) {
    return (
      <AppShell title="Free Outreach CRM" subtitle="Loading leads...">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#355cc9] border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Free Outreach CRM" subtitle="Track and send free cold email pitches to local Nashville businesses">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-xl border border-white/10 bg-[#16192a] px-5 py-3 text-sm font-medium text-zinc-200 shadow-2xl animate-in slide-in-from-top">
          {toast}
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Leads", value: stats.total, color: "text-zinc-100" },
          { label: "Emails Sent", value: stats.sent, color: "text-blue-400" },
          { label: "Replied", value: stats.replied, color: "text-amber-400" },
          { label: "Converted", value: stats.converted, color: "text-emerald-400" },
        ].map((s) => (
          <Surface key={s.label} className="p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">{s.label}</p>
            <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</p>
          </Surface>
        ))}
      </div>

      {/* Filters + Search */}
      <Surface className="mb-4 flex flex-wrap items-center gap-3 p-4">
        <input
          type="text"
          placeholder="Search business, industry, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none min-w-[200px]"
        />
        <div className="flex items-center gap-2">
          {(["all", "scraped", "sent", "replied", "converted"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                filter === f
                  ? "bg-[#355cc9] text-white"
                  : "border border-white/10 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </Surface>

      {/* Leads Table */}
      <Surface className="overflow-hidden">
        <div className="border-b border-white/5 px-5 py-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Leads ({filtered.length})</h2>
          <span className="text-xs text-zinc-500">Click &quot;Send Pitch&quot; to email a free trial offer</span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm font-medium">No leads found</p>
            <p className="mt-1 text-xs">Add leads to reports/scraped_leads.json or run the scraper.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((lead) => (
              <div key={lead.email} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                {/* Industry Icon / Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#355cc9]/20 text-lg">
                  {lead.industry.toLowerCase().includes("hvac") ? "❄️" :
                   lead.industry.toLowerCase().includes("plumb") ? "🔧" :
                   lead.industry.toLowerCase().includes("roof") ? "🏠" :
                   lead.industry.toLowerCase().includes("med") || lead.industry.toLowerCase().includes("spa") ? "💆" :
                   lead.industry.toLowerCase().includes("electric") ? "⚡" :
                   lead.industry.toLowerCase().includes("dent") ? "🦷" :
                   lead.industry.toLowerCase().includes("salon") ? "💇" :
                   lead.industry.toLowerCase().includes("land") ? "🌿" : "🏢"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-zinc-200 text-sm">{lead.business}</span>
                    <StatusBadge status={lead.status} />
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                    <span>{lead.industry}</span>
                    <span>·</span>
                    <span>{lead.email}</span>
                    {lead.phone && <><span>·</span><span>{lead.phone}</span></>}
                    {lead.sentAt && <><span>·</span><span>Sent {new Date(lead.sentAt).toLocaleDateString()}</span></>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {lead.website && (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-all"
                    >
                      Visit
                    </a>
                  )}

                  {lead.status === "sent" && (
                    <button
                      onClick={() => handleStatusChange(lead, "replied")}
                      className="rounded-lg border border-amber-500/30 px-3 py-1.5 text-xs text-amber-400 hover:bg-amber-500/10 transition-all"
                    >
                      Mark Replied
                    </button>
                  )}
                  {lead.status === "replied" && (
                    <button
                      onClick={() => handleStatusChange(lead, "converted")}
                      className="rounded-lg border border-emerald-500/30 px-3 py-1.5 text-xs text-emerald-400 hover:bg-emerald-500/10 transition-all"
                    >
                      Mark Converted
                    </button>
                  )}

                  {(lead.status === "scraped") && (
                    <button
                      onClick={() => handleSendEmail(lead)}
                      disabled={sending === lead.email}
                      className="rounded-lg bg-[#355cc9] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#456ce0] disabled:opacity-50 transition-all"
                    >
                      {sending === lead.email ? "Sending..." : "Send Pitch"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Surface>

      {/* Back link */}
      <div className="mt-4 text-center">
        <a href="/admin" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">← Back to Admin Panel</a>
      </div>
    </AppShell>
  );
}
