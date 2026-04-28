"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell, EmptyState, Surface } from "@/components/app-shell";
import { ContactModal } from "@/components/contact-modal";

type Contact = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  notes?: string | null;
};

type ContactPayload = {
  id?: string;
  fullName: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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

  const handleCreateContact = async (contact: ContactPayload) => {
    const response = await fetch("/api/contacts", {
      method: contact.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: contact.id,
        fullName: contact.fullName.trim(),
        email: contact.email?.trim() || null,
        phone: contact.phone?.trim() || null,
        company: contact.company?.trim() || null,
        notes: contact.notes?.trim() || null,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save contact");
    }

    const updated = await response.json();
    if (contact.id) {
      setContacts((prev) =>
        prev.map((c) => (c.id === contact.id ? updated : c))
      );
    } else {
      setContacts((prev) => [updated, ...prev]);
    }
    setSelectedContact(null);
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    setIsDeleting(id);
    try {
      const response = await fetch(`/api/contacts?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete contact");
      }

      setContacts((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedContact(null);
    setIsModalOpen(true);
  };

  return (
    <AppShell
      title="Contacts"
      subtitle={isLoading ? "Loading contacts..." : `${contacts.length} contacts`}
      action={
        <button
          onClick={handleAddNew}
          className="rounded-md bg-[#355cc9] px-3 py-2 text-sm font-medium text-white hover:bg-[#456ce0]"
        >
          + New Contact
        </button>
      }
    >
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
                <div className="min-w-0 flex-1">
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
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditContact(contact)}
                    className="rounded-md bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    disabled={isDeleting === contact.id}
                    className="rounded-md bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {isDeleting === contact.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Surface>

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedContact(null);
        }}
        onSave={handleCreateContact}
        initialContact={selectedContact}
      />
    </AppShell>
  );
}
