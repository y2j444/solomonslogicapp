"use client";

import { useEffect, useState } from "react";
import { AppShell, Surface } from "@/components/app-shell";

type Customer = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  businessName: string | null;
  businessPhone: string | null;
  AIPhone: string | null;
  knowledgeBase: string | null;
  callHandlingRules: string | null;
  subscriptionStatus: string;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: string | null;
  joinedAt: string;
  _count: {
    contacts: number;
    callLogs: number;
    appointments: number;
  };
};

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
      isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
      {isActive ? "Active" : status || "Inactive"}
    </span>
  );
}

function EditModal({
  customer,
  onClose,
  onSave,
}: {
  customer: Customer;
  onClose: () => void;
  onSave: (updated: Partial<Customer>) => void;
}) {
  const [form, setForm] = useState({
    businessName: customer.businessName || "",
    businessPhone: customer.businessPhone || "",
    AIPhone: customer.AIPhone || "",
    knowledgeBase: customer.knowledgeBase || "",
    callHandlingRules: customer.callHandlingRules || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: customer.id, ...form }),
      });
      if (res.ok) {
        setSaved(true);
        onSave({ ...customer, ...form });
        setTimeout(() => { setSaved(false); onClose(); }, 1000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#16192a] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
          <div>
            <h2 className="font-semibold text-zinc-100">Configure AI Receptionist</h2>
            <p className="mt-0.5 text-xs text-zinc-500">{customer.businessName || customer.email}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all">✕</button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Business Name</label>
              <input
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                className="w-full rounded-lg border border-white/5 bg-white/5 px-4 py-2.5 text-sm focus:border-[#355cc9] focus:outline-none focus:ring-1 focus:ring-[#355cc9] transition-all"
                placeholder="Peak Flow Plumbing"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Their Business Phone</label>
              <input
                value={form.businessPhone}
                onChange={(e) => setForm({ ...form, businessPhone: e.target.value })}
                className="w-full rounded-lg border border-white/5 bg-white/5 px-4 py-2.5 text-sm focus:border-[#355cc9] focus:outline-none focus:ring-1 focus:ring-[#355cc9] transition-all"
                placeholder="+16155551234"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">AI Phone Number (Sara&apos;s Number)</label>
            <input
              value={form.AIPhone}
              onChange={(e) => setForm({ ...form, AIPhone: e.target.value })}
              className="w-full rounded-lg border border-white/5 bg-white/5 px-4 py-2.5 text-sm font-mono focus:border-[#355cc9] focus:outline-none focus:ring-1 focus:ring-[#355cc9] transition-all"
              placeholder="+16151234567 (auto-assigned on subscribe)"
            />
            <p className="text-xs text-zinc-600">Assigned automatically when they subscribe. You can override it here.</p>
          </div>

          {/* Knowledge Base */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Knowledge Base</label>
            <p className="text-xs text-zinc-600">What Sara knows about this business — hours, services, pricing, FAQs.</p>
            <textarea
              value={form.knowledgeBase}
              onChange={(e) => setForm({ ...form, knowledgeBase: e.target.value })}
              rows={8}
              className="w-full rounded-lg border border-white/5 bg-white/5 px-4 py-3 text-sm leading-relaxed focus:border-[#355cc9] focus:outline-none focus:ring-1 focus:ring-[#355cc9] transition-all resize-y"
              placeholder={`Business: Peak Flow Plumbing
Hours: Mon–Fri 8am–6pm, Sat 9am–2pm, closed Sunday
Services: Drain cleaning, water heater install, leak repair, emergency calls
Emergency line: Available 24/7 for burst pipes and floods
Pricing: Free estimates on all jobs. Service call fee: $75 (waived if work is booked)
Owner: Mike Johnson — (615) 555-1234`}
            />
          </div>

          {/* Call Handling Rules */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Call Handling Rules</label>
            <p className="text-xs text-zinc-600">How Sara should behave — what to do, what to avoid, how to escalate.</p>
            <textarea
              value={form.callHandlingRules}
              onChange={(e) => setForm({ ...form, callHandlingRules: e.target.value })}
              rows={6}
              className="w-full rounded-lg border border-white/5 bg-white/5 px-4 py-3 text-sm leading-relaxed focus:border-[#355cc9] focus:outline-none focus:ring-1 focus:ring-[#355cc9] transition-all resize-y"
              placeholder={`- Always try to book an appointment before ending the call
- For emergencies (flood, burst pipe), collect name & address, say owner will call within 15 min
- Do NOT quote exact prices — say "free estimate" and book the visit
- If caller asks for Mike directly, say he's in the field and you're taking his calls
- Appointments are 30 min blocks. Only book Mon–Sat during business hours.
- Collect: caller's name, phone number, address, and nature of the problem`}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-white/5 px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-all">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`rounded-lg px-6 py-2 text-sm font-semibold transition-all shadow-lg ${
              saved
                ? "bg-emerald-500 text-white shadow-emerald-500/20"
                : "bg-[#355cc9] text-white hover:bg-[#456ce0] shadow-blue-500/20 disabled:opacity-50"
            }`}
          >
            {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((res) => {
        if (!res.ok) throw new Error("Access denied");
        return res.json();
      })
      .then((data) => { setCustomers(data); setIsLoading(false); })
      .catch((e) => { setError(e.message); setIsLoading(false); });
  }, []);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.email.toLowerCase().includes(q) ||
      (c.businessName || "").toLowerCase().includes(q) ||
      (c.firstName || "").toLowerCase().includes(q) ||
      (c.AIPhone || "").includes(q)
    );
  });

  const activeCount = customers.filter((c) => c.subscriptionStatus === "active").length;
  const mrr = activeCount * 199;

  if (isLoading) {
    return (
      <AppShell title="Admin" subtitle="Loading...">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#355cc9] border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Admin" subtitle="Access denied">
        <Surface className="p-8 text-center">
          <p className="text-red-400 font-semibold">🚫 {error}</p>
          <p className="mt-2 text-sm text-zinc-500">This area is restricted to the account owner.</p>
        </Surface>
      </AppShell>
    );
  }

  return (
    <AppShell title="Admin Panel" subtitle="Manage all Solomon's Logic customers">
      {/* Quick Links */}
      <div className="mb-6 flex items-center gap-3">
        <a
          href="/admin/free-leads"
          className="inline-flex items-center gap-2 rounded-lg bg-[#355cc9]/20 border border-[#355cc9]/30 px-4 py-2 text-sm font-medium text-[#5b7cfa] hover:bg-[#355cc9]/30 transition-all"
        >
          📋 Free Outreach CRM
        </a>
      </div>
      {/* Stats Row */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Customers", value: customers.length },
          { label: "Active Subscriptions", value: activeCount },
          { label: "Monthly Revenue", value: `$${mrr.toLocaleString()}` },
          { label: "ARR", value: `$${(mrr * 12).toLocaleString()}` },
        ].map((stat) => (
          <Surface key={stat.label} className="p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-zinc-100">{stat.value}</p>
          </Surface>
        ))}
      </div>

      {/* Search */}
      <Surface className="mb-4">
        <div className="px-4 py-3">
          <input
            type="text"
            placeholder="Search by business, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none"
          />
        </div>
      </Surface>

      {/* Customer Table */}
      <Surface className="overflow-hidden">
        <div className="border-b border-white/5 px-5 py-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Customers ({filtered.length})</h2>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-sm font-medium">{search ? "No customers match your search" : "No customers yet"}</p>
            <p className="mt-1 text-xs">{!search && "They'll appear here as soon as someone signs up."}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((customer) => (
              <div key={customer.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#355cc9]/20 text-sm font-bold text-[#5b7cfa]">
                  {(customer.firstName?.[0] || customer.email[0] || "?").toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-zinc-200 text-sm">
                      {customer.firstName} {customer.lastName}
                    </span>
                    <StatusBadge status={customer.subscriptionStatus} />
                    {customer.AIPhone && (
                      <span className="rounded-full bg-[#355cc9]/20 px-2 py-0.5 text-[10px] font-mono text-[#5b7cfa]">
                        {customer.AIPhone}
                      </span>
                    )}
                    {!customer.AIPhone && customer.subscriptionStatus === "active" && (
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-400">
                        ⚠ No AI number
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                    <span>{customer.businessName || <em>No business name</em>}</span>
                    <span>·</span>
                    <span>{customer.email}</span>
                    <span>·</span>
                    <span>{customer._count.callLogs} calls · {customer._count.appointments} appts · {customer._count.contacts} contacts</span>
                  </div>
                  {!customer.knowledgeBase && (
                    <p className="mt-1 text-[11px] text-amber-400/70">⚠ No knowledge base configured — Sara is using defaults</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditing(customer)}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/5 hover:text-zinc-100 hover:border-white/20 transition-all"
                  >
                    Configure Sara
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Surface>

      {/* Edit Modal */}
      {editing && (
        <EditModal
          customer={editing}
          onClose={() => setEditing(null)}
          onSave={(updated) => {
            setCustomers((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
            setEditing(null);
          }}
        />
      )}
    </AppShell>
  );
}
