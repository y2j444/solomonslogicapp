"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Surface } from "@/components/app-shell";

type Profile = {
  firstName: string | null;
  lastName: string | null;
  businessName: string | null;
  businessPhone: string | null;
  AIPhone: string | null;
  subscriptionStatus?: string;
};

const steps = [
  { n: 1, label: "Your Info" },
  { n: 2, label: "Start Trial" },
  { n: 3, label: "Forward Number" },
  { n: 4, label: "Sara Goes Live" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({
    firstName: "",
    lastName: "",
    businessName: "",
    businessPhone: "",
    AIPhone: null,
    subscriptionStatus: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetch("/api/users/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          businessName: data.businessName || "",
          businessPhone: data.businessPhone || "",
          AIPhone: data.AIPhone || null,
          subscriptionStatus: data.subscriptionStatus || "",
        });

        // Determine which step the user is on
        if (data.AIPhone) {
          setStep(4);
        } else if (data.subscriptionStatus === "active") {
          setStep(3);
        } else if (data.firstName && data.businessName) {
          setStep(2);
        } else {
          setStep(1);
        }

        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        setStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#11131b]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#355cc9] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#11131b] px-4 py-12 text-zinc-100">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#355cc9] text-2xl font-bold text-white shadow-xl shadow-blue-500/30">
          S
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Solomon&apos;s Logic 🎉</h1>
        <p className="mt-2 text-zinc-400">Your AI receptionist, Sara, is 4 steps away from answering your calls.</p>
      </div>

      {/* Step Tracker */}
      <div className="mb-10 flex items-center gap-2 text-xs">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                  step >= s.n
                    ? "bg-[#355cc9] text-white shadow shadow-blue-500/30"
                    : "bg-white/10 text-zinc-500"
                }`}
              >
                {step > s.n ? "✓" : s.n}
              </span>
              <span className={step >= s.n ? "text-zinc-200 font-medium" : "text-zinc-600"}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`h-px w-8 transition-all ${step > s.n ? "bg-[#355cc9]/60" : "bg-white/10"}`} />}
          </div>
        ))}
      </div>

      <div className="w-full max-w-lg space-y-5">

        {/* STEP 1: Your Info */}
        <div className={`rounded-2xl border transition-all ${step === 1 ? "border-[#355cc9]/40 bg-[#355cc9]/5" : step > 1 ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/5 bg-white/[0.02]"}`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step > 1 ? "bg-emerald-500 text-white" : "bg-[#355cc9] text-white"}`}>
                {step > 1 ? "✓" : "1"}
              </span>
              <span className="font-semibold">Your Business Info</span>
            </div>
            {step > 1 && <span className="text-xs text-emerald-400 font-medium">Done</span>}
          </div>

          {step === 1 && (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">First Name</label>
                  <input
                    required
                    type="text"
                    value={profile.firstName || ""}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="w-full rounded-lg border border-white/5 bg-white/5 px-4 py-2.5 text-sm focus:border-[#355cc9] focus:outline-none focus:ring-1 focus:ring-[#355cc9] transition-all"
                    placeholder="Michael"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Last Name</label>
                  <input
                    required
                    type="text"
                    value={profile.lastName || ""}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className="w-full rounded-lg border border-white/5 bg-white/5 px-4 py-2.5 text-sm focus:border-[#355cc9] focus:outline-none focus:ring-1 focus:ring-[#355cc9] transition-all"
                    placeholder="Janico"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Business Name</label>
                <input
                  required
                  type="text"
                  value={profile.businessName || ""}
                  onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                  className="w-full rounded-lg border border-white/5 bg-white/5 px-4 py-2.5 text-sm focus:border-[#355cc9] focus:outline-none focus:ring-1 focus:ring-[#355cc9] transition-all"
                  placeholder="e.g. Peak Flow Plumbing"
                />
                <p className="text-xs text-zinc-600">Sara will greet callers with this name.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Your Current Business Phone</label>
                <input
                  required
                  type="text"
                  value={profile.businessPhone || ""}
                  onChange={(e) => setProfile({ ...profile, businessPhone: e.target.value })}
                  className="w-full rounded-lg border border-white/5 bg-white/5 px-4 py-2.5 text-sm focus:border-[#355cc9] focus:outline-none focus:ring-1 focus:ring-[#355cc9] transition-all"
                  placeholder="+16155551234"
                />
                <p className="text-xs text-zinc-600">The number your customers already call. You will forward this to Sara in step 3.</p>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full rounded-lg bg-[#355cc9] py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-[#456ce0] transition-all disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save & Continue →"}
              </button>
            </form>
          )}

          {step > 1 && (
            <div className="px-6 py-4 flex items-center justify-between">
              <span className="text-sm text-zinc-400">{profile.businessName} · {profile.businessPhone}</span>
              <button onClick={() => setStep(1)} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Edit</button>
            </div>
          )}
        </div>

        {/* STEP 2: Subscribe */}
        <div className={`rounded-2xl border transition-all ${step === 2 ? "border-[#355cc9]/40 bg-[#355cc9]/5" : step > 2 ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/5 bg-white/[0.02] opacity-60"}`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step > 2 ? "bg-emerald-500 text-white" : step === 2 ? "bg-[#355cc9] text-white" : "bg-white/10 text-zinc-500"}`}>
                {step > 2 ? "✓" : "2"}
              </span>
              <span className="font-semibold">Start 1-Month Free Trial</span>
            </div>
            {step > 2 && <span className="text-xs text-emerald-400 font-medium">Active</span>}
          </div>

          {step === 2 && (
            <div className="p-6 space-y-4">
              <p className="text-sm text-zinc-400 leading-relaxed">
                Your subscription activates Sara and auto-provisions a dedicated phone number for your business. Takes about 60 seconds after payment.
              </p>
              <ul className="space-y-2 text-sm text-zinc-400">
                {["24/7 AI receptionist — Sara answers every call", "Dedicated local phone number (yours to keep)", "Real-time appointment booking into your calendar", "Full CRM: contacts, leads, call logs & SMS", "Cancel anytime"].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-400 shrink-0">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={async () => {
                  const res = await fetch("/api/stripe/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ priceId: "price_1TdcFBFYw42U1vfCoqfPDqZP" }),
                  });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                }}
                className="w-full rounded-lg bg-[#355cc9] py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-[#456ce0] transition-all"
              >
                Start 1-Month Free Trial →
              </button>
              <p className="text-center text-[11px] text-zinc-600">Secured by Stripe · Cancel anytime</p>
            </div>
          )}

          {step > 2 && (
            <div className="px-6 py-4">
              <span className="text-sm text-zinc-400">Professional Plan · Active</span>
            </div>
          )}
        </div>

        {/* STEP 3: Forward Number */}
        <div className={`rounded-2xl border transition-all ${step === 3 ? "border-[#355cc9]/40 bg-[#355cc9]/5" : step > 3 ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/5 bg-white/[0.02] opacity-60"}`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step > 3 ? "bg-emerald-500 text-white" : step === 3 ? "bg-[#355cc9] text-white" : "bg-white/10 text-zinc-500"}`}>
                {step > 3 ? "✓" : "3"}
              </span>
              <span className="font-semibold">Forward Your Business Number to Sara</span>
            </div>
            {step > 3 && <span className="text-xs text-emerald-400 font-medium">Done</span>}
          </div>

          {step === 3 && (
            <div className="p-6 space-y-5">
              {profile.AIPhone ? (
                <>
                  <div className="rounded-xl border border-[#355cc9]/30 bg-[#355cc9]/10 p-5">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">Your Dedicated Sara Number</p>
                    <p className="text-2xl font-mono font-bold text-white tracking-wide">{profile.AIPhone}</p>
                    <p className="mt-2 text-xs text-zinc-500">This number is exclusively yours. Sara will answer it as {profile.businessName || "your business"}.</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-zinc-200">How to activate call forwarding:</p>

                    <div className="space-y-2">
                      {[
                        { icon: "📱", title: "AT&T / T-Mobile / Most carriers", code: `*72 ${profile.AIPhone}` },
                        { icon: "📱", title: "Verizon", code: `*71 ${profile.AIPhone}` },
                        { icon: "📞", title: "Landline (most providers)", code: `72# ${profile.AIPhone}` },
                      ].map((c) => (
                        <div key={c.title} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3">
                          <div>
                            <p className="text-xs text-zinc-500">{c.icon} {c.title}</p>
                            <p className="mt-0.5 font-mono text-sm font-semibold text-zinc-200">{c.code}</p>
                          </div>
                          <button
                            onClick={() => navigator.clipboard.writeText(c.code)}
                            className="rounded-md border border-white/10 px-3 py-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 hover:border-white/20 transition-all"
                          >
                            Copy
                          </button>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Dial the code above from your business phone and press Call. This tells your carrier to forward unanswered calls (after 3–4 rings) to Sara. <strong className="text-zinc-300">Your number stays the same</strong> — Sara only picks up when you can&apos;t.
                    </p>

                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">
                      💡 <strong>Tip:</strong> To disable forwarding later, dial <span className="font-mono">*73</span> (AT&T/T-Mobile) or <span className="font-mono">*71</span> (Verizon).
                    </div>

                    <button
                      onClick={() => setStep(4)}
                      className="w-full rounded-lg bg-[#355cc9] py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-[#456ce0] transition-all mt-2"
                    >
                      I&apos;ve Forwarded My Number →
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#355cc9]/20">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#355cc9] border-t-transparent" />
                  </div>
                  <p className="text-sm font-semibold text-zinc-300">Provisioning your dedicated number...</p>
                  <p className="text-xs text-zinc-500">This takes 1–2 minutes after payment. Refresh this page shortly.</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 rounded-lg border border-white/10 px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200 hover:border-white/20 transition-all"
                  >
                    Refresh
                  </button>
                </div>
              )}
            </div>
          )}

          {step > 3 && (
            <div className="px-6 py-4">
              <span className="text-sm text-zinc-400">Forwarding active → {profile.AIPhone}</span>
            </div>
          )}
        </div>

        {/* STEP 4: Live */}
        <div className={`rounded-2xl border transition-all ${step === 4 ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/5 bg-white/[0.02] opacity-60"}`}>
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step === 4 ? "bg-emerald-500 text-white" : "bg-white/10 text-zinc-500"}`}>
              {step === 4 ? "✓" : "4"}
            </span>
            <span className="font-semibold">Sara is Live 🎉</span>
          </div>

          {step === 4 && (
            <div className="p-6 space-y-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Active</span>
                </div>
                <p className="text-2xl font-mono font-bold text-white tracking-wide">{profile.AIPhone}</p>
                <p className="mt-1 text-xs text-zinc-400">Sara is answering calls for <strong className="text-zinc-300">{profile.businessName || "your business"}</strong></p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-zinc-200">Test it right now:</p>
                <p className="text-sm text-zinc-400">Call your business number <span className="font-mono text-zinc-300">{profile.businessPhone}</span> and don&apos;t answer — Sara will pick up after 3 rings, greet the caller as {profile.businessName || "your business"}, and offer to book an appointment.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href="/"
                  className="flex items-center justify-center rounded-lg bg-[#355cc9] py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-[#456ce0] transition-all"
                >
                  Go to Dashboard →
                </a>
                <a
                  href="/settings"
                  className="flex items-center justify-center rounded-lg border border-white/10 py-3 text-sm font-medium text-zinc-300 hover:border-white/20 hover:text-white transition-all"
                >
                  Settings
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Support */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] px-5 py-4 text-xs text-zinc-500 text-center">
          Questions? Email <a href="mailto:support@solomonslogic.com" className="text-zinc-300 hover:text-white transition-colors">support@solomonslogic.com</a> — we respond same day.
        </div>

        <p className="text-center text-[11px] text-zinc-700 pb-6">
          By completing setup, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
