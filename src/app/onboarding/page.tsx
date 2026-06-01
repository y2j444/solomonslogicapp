"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Surface } from "@/components/app-shell";

type Profile = {
  firstName: string | null;
  lastName: string | null;
  businessName: string | null;
  businessPhone: string | null;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({
    firstName: "",
    lastName: "",
    businessName: "",
    businessPhone: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/users/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          businessName: data.businessName || "",
          businessPhone: data.businessPhone || "",
        });
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
        router.push("/");
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#11131b] p-6 text-zinc-100">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-[#355cc9] text-xl font-bold text-white shadow-lg shadow-blue-500/20">
          S
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome to Solomon&apos;s Logic 🎉</h1>
        <p className="mt-2 text-zinc-500">You&apos;re 3 minutes away from never missing a call again.</p>
      </div>

      <div className="mb-6 flex items-center gap-3 text-xs text-zinc-500">
        <div className="flex items-center gap-1.5"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#355cc9] text-[10px] font-bold text-white">1</span><span className="font-medium text-zinc-300">Your Info</span></div>
        <div className="h-px w-8 bg-white/10" />
        <div className="flex items-center gap-1.5"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold">2</span><span>Forward Your Number</span></div>
        <div className="h-px w-8 bg-white/10" />
        <div className="flex items-center gap-1.5"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold">3</span><span>Sara Goes Live</span></div>
      </div>

      <Surface className="w-full max-w-md p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="e.g. Solomon's Logic LLC"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Business Phone Number</label>
            <input
              required
              type="text"
              value={profile.businessPhone || ""}
              onChange={(e) => setProfile({ ...profile, businessPhone: e.target.value })}
              className="w-full rounded-lg border border-white/5 bg-white/5 px-4 py-2.5 text-sm focus:border-[#355cc9] focus:outline-none focus:ring-1 focus:ring-[#355cc9] transition-all"
              placeholder="+12223334444"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-lg bg-[#355cc9] py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-[#456ce0] transition-all disabled:opacity-50"
            >
              {isSaving ? "Setting up..." : "Complete Setup"}
            </button>
          </div>
        </form>
      </Surface>
      
      <div className="mt-8 w-full max-w-md rounded-xl border border-white/5 bg-white/[0.02] p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">After you hit Complete Setup →</p>
        <div className="space-y-4">
          <div className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#355cc9]/20 text-xs font-bold text-[#5b7cfa]">2</span>
            <div>
              <p className="text-sm font-semibold text-zinc-200">Forward your business number to Sara</p>
              <p className="mt-0.5 text-xs text-zinc-500">On your phone, dial <span className="font-mono text-zinc-300">*72 (615) 716-3328</span> and press call. Takes 10 seconds. Your number stays the same — Sara just picks up when you can&apos;t.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#355cc9]/20 text-xs font-bold text-[#5b7cfa]">3</span>
            <div>
              <p className="text-sm font-semibold text-zinc-200">Test it — call your own number</p>
              <p className="mt-0.5 text-xs text-zinc-500">Sara will answer within 1 second. Try asking her to book an appointment. Every call shows up in your dashboard in real time.</p>
            </div>
          </div>
        </div>
        <div className="mt-5 rounded-lg border border-[#355cc9]/20 bg-[#355cc9]/10 p-3 text-xs text-zinc-400">
          💬 Questions? Text or call us at <span className="font-semibold text-zinc-200">(615) 716-3328</span> — we respond same day.
        </div>
      </div>

      <p className="mt-6 text-xs text-zinc-600">
        By completing setup, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
