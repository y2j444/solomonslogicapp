"use client";

import { useEffect, useState } from "react";
import { AppShell, Surface } from "@/components/app-shell";

type Profile = {
  firstName: string | null;
  lastName: string | null;
  businessName: string | null;
  businessPhone: string | null;
  AIPhone: string | null;
  email: string;
  subscriptionStatus?: string;
  stripePriceId?: string | null;
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/users/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          businessName: profile.businessName,
          businessPhone: profile.businessPhone,
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully." });
      } else {
        setMessage({ type: "error", text: "Failed to update profile." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An error occurred while saving." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell title="Settings" subtitle="Loading your profile...">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#355cc9] border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Settings" subtitle="Manage your business profile and integrations">
      <div className="max-w-2xl">
        <Surface className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">First Name</label>
                <input
                  type="text"
                  value={profile?.firstName ?? ""}
                  onChange={(e) => setProfile({ ...profile!, firstName: e.target.value })}
                  className="w-full rounded-lg border border-white/5 bg-white/5 px-4 py-2 text-sm focus:border-[#355cc9] focus:outline-none focus:ring-1 focus:ring-[#355cc9]"
                  placeholder="First Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Last Name</label>
                <input
                  type="text"
                  value={profile?.lastName ?? ""}
                  onChange={(e) => setProfile({ ...profile!, lastName: e.target.value })}
                  className="w-full rounded-lg border border-white/5 bg-white/5 px-4 py-2 text-sm focus:border-[#355cc9] focus:outline-none focus:ring-1 focus:ring-[#355cc9]"
                  placeholder="Last Name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Business Name</label>
              <input
                type="text"
                value={profile?.businessName ?? ""}
                onChange={(e) => setProfile({ ...profile!, businessName: e.target.value })}
                className="w-full rounded-lg border border-white/5 bg-white/5 px-4 py-2 text-sm focus:border-[#355cc9] focus:outline-none focus:ring-1 focus:ring-[#355cc9]"
                placeholder="e.g. Peak Flow Plumbing"
              />
              <p className="text-xs text-zinc-500">This is how the AI receptionist will refer to your company.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Business Phone Number</label>
              <input
                type="text"
                value={profile?.businessPhone ?? ""}
                onChange={(e) => setProfile({ ...profile!, businessPhone: e.target.value })}
                className="w-full rounded-lg border border-white/5 bg-white/5 px-4 py-2 text-sm focus:border-[#355cc9] focus:outline-none focus:ring-1 focus:ring-[#355cc9]"
                placeholder="+1234567890"
              />
              <p className="text-xs text-zinc-500">
                Your primary business line. The AI receptionist will use this for context and potentially for call transfers.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-lg bg-[#355cc9] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#456ce0] disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
            </div>

            {message && (
              <div
                className={`rounded-lg border p-4 text-sm ${
                  message.type === "success"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    : "border-red-500/20 bg-red-500/10 text-red-400"
                }`}
              >
                {message.text}
              </div>
            )}
          </form>
        </Surface>

        <Surface className="mt-4 p-6">
          <h3 className="text-sm font-semibold">AI Receptionist Integration</h3>
          <div className="mt-4 space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">AI Phone Number</span>
              {profile?.AIPhone ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-mono text-emerald-400">{profile.AIPhone}</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500 uppercase">Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400 italic">Pending assignment...</span>
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500 uppercase">Processing</span>
                </div>
              )}
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                This is the dedicated AI number assigned to your business. 
                Calls to this number will be answered by your custom AI receptionist.
              </p>
            </div>
            
            <div className="border-t border-white/5 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Account Status</span>
                <span className="text-zinc-100 font-medium">Provisioned</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-zinc-500">Service Plan</span>
                <span className="text-blue-400 font-medium">Standard Voice AI</span>
              </div>
            </div>
          </div>
        </Surface>

        {/* --- Billing & Subscription --- */}
        <Surface className="mt-4 p-6">
          <h3 className="text-sm font-semibold">Billing & Subscription</h3>
          <p className="mt-1 text-xs text-zinc-500">
            Manage your plan to keep the AI Receptionist active.
          </p>

          <div className="mt-4 border-t border-white/5 pt-4">
            <div className="flex justify-between items-center mb-6 text-sm">
              <span className="text-zinc-500">Current Status</span>
              {profile?.subscriptionStatus === "active" ? (
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500 uppercase">
                  Active
                </span>
              ) : (
                <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-500 uppercase">
                  {profile?.subscriptionStatus || "Inactive"}
                </span>
              )}
            </div>

            <div className="max-w-md">
              {[
                { name: "Professional Plan", price: "$199", priceId: "price_1TdcFBFYw42U1vfCoqfPDqZP", description: "Full access to the AI Receptionist. Never miss a call." },
              ].map((tier) => {
                const isActive = profile?.stripePriceId === tier.priceId && profile?.subscriptionStatus === "active";
                return (
                  <div
                    key={tier.name}
                    className={`rounded-xl border p-5 flex flex-col justify-between ${
                      isActive
                        ? "border-[#355cc9] bg-[#355cc9]/10"
                        : "border-white/5 bg-white/[0.02]"
                    }`}
                  >
                    <div>
                      <h4 className="font-semibold text-zinc-200">{tier.name}</h4>
                      <p className="mt-1 text-xs text-zinc-400">{tier.description}</p>
                      <p className="text-3xl font-bold mt-4">
                        {tier.price}<span className="text-sm font-normal text-zinc-500">/mo</span>
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/stripe/checkout", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ priceId: tier.priceId }),
                          });
                          const data = await res.json();
                          if (data.url) {
                            window.location.href = data.url;
                          } else {
                            alert(data.error || "Failed to start checkout");
                          }
                        } catch (e) {
                          alert("Error connecting to checkout.");
                        }
                      }}
                      disabled={isActive}
                      className={`mt-6 w-full rounded-lg py-3 text-sm font-semibold transition shadow-lg ${
                        isActive
                          ? "bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none"
                          : "bg-[#355cc9] text-white hover:bg-[#456ce0] shadow-blue-500/20"
                      }`}
                    >
                      {isActive ? "Active Plan" : "Subscribe Now"}
                    </button>
                  </div>
                );
              })}
            </div>
            
            <p className="mt-4 text-[10px] text-zinc-600">
              Payments are secured by Stripe. Your AI phone number will be automatically assigned after checkout.
            </p>
          </div>
        </Surface>
      </div>
    </AppShell>
  );
}
