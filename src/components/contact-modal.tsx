"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ContactPayload = {
  id?: string;
  fullName: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
};

type ContactInitialValue = {
  id?: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  notes?: string | null;
};

type ContactModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: ContactPayload) => Promise<void>;
  initialContact?: ContactInitialValue | null;
};

const initialFormData = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  notes: "",
};

export function ContactModal({ isOpen, onClose, onSave, initialContact }: ContactModalProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const isEditMode = !!initialContact?.id;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setFormError(null);
    } else if (initialContact) {
      setFormData({
        fullName: initialContact.fullName,
        email: initialContact.email ?? "",
        phone: initialContact.phone ?? "",
        company: initialContact.company ?? "",
        notes: initialContact.notes ?? "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [isOpen, initialContact]);

  if (!isMounted || !isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.fullName.trim()) {
      setFormError("Full name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave({
        id: initialContact?.id,
        fullName: formData.fullName,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        notes: formData.notes || undefined,
      });
      onClose();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : isEditMode
            ? "Failed to update contact"
            : "Failed to create contact"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden rounded-xl bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-white px-8 py-8 border-b border-slate-200">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
          </div>

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-3 py-1.5 mb-4">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  {isEditMode ? "Edit" : "New"} Contact
                </span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isEditMode ? "Edit Contact Details" : "Create New Contact"}
              </h1>
              <p className="mt-2 text-sm text-slate-600 max-w-md">
                {isEditMode
                  ? "Update the contact information and save your changes."
                  : "Add a person or business to your CRM with key details for follow-up."}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {formError && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex gap-3">
                <svg
                  className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-900">{formError}</p>
                </div>
              </div>
            )}

            <div className="grid gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  placeholder="John Doe"
                  autoFocus
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Email and Phone */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, company: e.target.value }))
                  }
                  placeholder="Acme Inc."
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Add any additional notes..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer with buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-8 py-4 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-100 hover:border-slate-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.fullName.trim() || isSubmitting}
              className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isSubmitting && (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update Contact"
                  : "Create Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
