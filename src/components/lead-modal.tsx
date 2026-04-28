"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type LeadPayload = {
  id?: string;
  leadTitle: string;
  stage?: string;
  source?: string;
  dealValue?: number;
  notes?: string;
};

type LeadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: LeadPayload) => Promise<void>;
  initialLead?: LeadPayload | null;
};

const initialFormData = {
  leadTitle: "",
  stage: "New",
  source: "",
  dealValue: "",
  notes: "",
};

const stages = ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"];

export function LeadModal({ isOpen, onClose, onSave, initialLead }: LeadModalProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const isEditMode = !!initialLead?.id;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setFormError(null);
    } else if (initialLead) {
      setFormData({
        leadTitle: initialLead.leadTitle,
        stage: initialLead.stage ?? "New",
        source: initialLead.source ?? "",
        dealValue: initialLead.dealValue ? String(initialLead.dealValue) : "",
        notes: initialLead.notes ?? "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [isOpen, initialLead]);

  if (!isMounted || !isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.leadTitle.trim()) {
      setFormError("Lead title is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const dealValue = formData.dealValue ? parseFloat(formData.dealValue) : 0;
      if (isNaN(dealValue)) {
        setFormError("Deal value must be a valid number");
        setIsSubmitting(false);
        return;
      }

      await onSave({
        id: initialLead?.id,
        leadTitle: formData.leadTitle,
        stage: formData.stage,
        source: formData.source,
        dealValue,
        notes: formData.notes,
      });
      onClose();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : isEditMode
            ? "Failed to update lead"
            : "Failed to create lead"
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
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
          </div>

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 border border-purple-200 px-3 py-1.5 mb-4">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v4h8v-4zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <span className="text-xs font-semibold uppercase tracking-wide text-purple-700">
                  {isEditMode ? "Edit" : "New"} Lead
                </span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isEditMode ? "Edit Lead Details" : "Create New Lead"}
              </h1>
              <p className="mt-2 text-sm text-slate-600 max-w-md">
                {isEditMode
                  ? "Update the lead information and track your sales pipeline."
                  : "Add a new opportunity to your sales pipeline and track its progress."}
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
              {/* Lead Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Lead Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.leadTitle}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, leadTitle: e.target.value }))
                  }
                  placeholder="Project Name or Opportunity"
                  autoFocus
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Stage and Source */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Stage
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, stage: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    {stages.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Source
                  </label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, source: e.target.value }))
                    }
                    placeholder="Website, Referral, etc."
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Deal Value */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Deal Value
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.dealValue}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, dealValue: e.target.value }))
                  }
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                  placeholder="Add details about this opportunity..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
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
              disabled={!formData.leadTitle.trim() || isSubmitting}
              className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isSubmitting && (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update Lead"
                  : "Create Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

