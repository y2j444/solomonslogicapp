"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell, EmptyState, Surface } from "@/components/app-shell";

type Contact = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
  });

  useEffect(() => {
    void fetch("/api/contacts")
      .then((r) => r.json())
      .then(setContacts)
      .catch(() => setContacts([]))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((contact) =>
      [contact.fullName, contact.email, contact.phone, contact.company]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [contacts, query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const newContact = await response.json();
        setContacts((prev) => [newContact, ...prev]);
        setFormData({ fullName: "", email: "", phone: "", company: "" });
        setShowForm(false);
      }
    } catch (error) {
      console.error("Failed to create contact:", error);
    }
  };

  return (
    <AppShell
      title="Contacts"
      subtitle={isLoading ? "Loading contacts..." : `${contacts.length} contacts`}
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
          <h2 className="text-sm font-semibold">Add New Contact</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm text-zinc-400">Full Name *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="mt-1 w-full rounded-md border border-white/10 bg-[#161a27] px-3 py-2 text-sm outline-none focus:border-[#4f71e8]"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 w-full rounded-md border border-white/10 bg-[#161a27] px-3 py-2 text-sm outline-none focus:border-[#4f71e8]"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 w-full rounded-md border border-white/10 bg-[#161a27] px-3 py-2 text-sm outline-none focus:border-[#4f71e8]"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="mt-1 w-full rounded-md border border-white/10 bg-[#161a27] px-3 py-2 text-sm outline-none focus:border-[#4f71e8]"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-md bg-[#355cc9] px-3 py-2 text-sm font-medium text-white hover:bg-[#456ce0]"
              >
                Create Contact
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

      <div className="mb-3 max-w-xs">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search contacts..."
          className="w-full rounded-md border border-white/10 bg-[#161a27] px-3 py-2 text-sm outline-none placeholder:text-zinc-500 focus:border-[#4f71e8]"
        />
      </div>
      <div className="mb-3 max-w-xs">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search contacts..."
          className="w-full rounded-md border border-white/10 bg-[#161a27] px-3 py-2 text-sm outline-none placeholder:text-zinc-500 focus:border-[#4f71e8]"
        />
      </div>

      <Surface className="overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <EmptyState
              title="Loading contacts..."
              description="Fetching your CRM records."
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No contacts yet."
              description="Add your first contact to start building the CRM."
            />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-white/[0.03]"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold uppercase tracking-wide text-zinc-100">
                    {contact.fullName}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {contact.email ?? "—"} · {contact.company ?? "Solomon's Logic"}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs text-zinc-500">{contact.phone ?? "—"}</div>
                  <div className="mt-1 inline-flex rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-300">
                    {contact.status}
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