"use client";

import Link from "next/link";
import { useUser, SignUpButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell, EmptyState, MetricCard, Surface } from "@/components/app-shell";

// ─── Dashboard types (unchanged) ─────────────────────────────────────────────
type AppointmentItem = {
  id: string;
  title: string;
  startTime: string;
  durationMinutes: number;
  status: string;
  contact: { id: string; fullName: string } | null;
};
type CallItem = {
  id: string;
  callerPhone: string;
  direction: string;
  durationSeconds: number;
  calledAt: string;
  contact: { id: string; fullName: string } | null;
};
type DashboardData = {
  totalContacts: number;
  totalLeads: number;
  totalAppointments: number;
  upcomingAppointmentsCount: number;
  recentCalls: number;
  upcomingAppointments: AppointmentItem[];
  recentCallItems: CallItem[];
  AIPhone?: string | null;
  businessPhone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  businessName?: string | null;
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString([], {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}
function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

// ─── Public Landing Page ──────────────────────────────────────────────────────
function LandingPage() {
  const DEMO_NUMBER = "(615) 716-3328";
  const DEMO_NUMBER_TEL = "+16157163328";

  return (
    <div style={{ fontFamily: "'Inter', 'Geist', system-ui, sans-serif", background: "#0a0c14", minHeight: "100vh", color: "#f1f5f9" }}>

      {/* ── Nav ── */}
      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 2rem", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "rgba(10,12,20,0.9)", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #5b7cfa, #7c3aed)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: "14px" }}>S</div>
          <span style={{ fontWeight: 700, fontSize: "15px", letterSpacing: "-0.3px" }}>Solomon's Logic</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href={`tel:${DEMO_NUMBER_TEL}`} style={{ color: "#94a3b8", fontSize: "13px", textDecoration: "none" }}>
            Try Demo: <strong style={{ color: "#5b7cfa" }}>{DEMO_NUMBER}</strong>
          </a>
          <Link href="/sign-in" style={{ padding: "8px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", color: "#f1f5f9", fontSize: "13px", fontWeight: 500, textDecoration: "none", border: "1px solid rgba(255,255,255,0.08)" }}>
            Sign In
          </Link>
          <SignUpButton mode="modal">
            <button style={{ padding: "8px 16px", borderRadius: "8px", background: "linear-gradient(135deg, #5b7cfa, #7c3aed)", color: "#fff", fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer" }}>
              Get Started Free
            </button>
          </SignUpButton>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ textAlign: "center", padding: "100px 2rem 80px", maxWidth: "820px", margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(91,124,250,0.12)", border: "1px solid rgba(91,124,250,0.25)", borderRadius: "100px", padding: "6px 14px", fontSize: "12px", color: "#5b7cfa", fontWeight: 600, marginBottom: "28px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
          🟢 Live in Nashville, TN — Try it right now
        </div>
        <h1 style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1, margin: "0 0 24px", background: "linear-gradient(135deg, #f1f5f9 40%, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Your Business Never<br />Misses a Call Again.
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#94a3b8", maxWidth: "540px", margin: "0 auto 48px", lineHeight: 1.7 }}>
          Sara is your AI receptionist. She answers instantly, sounds completely human, and books appointments directly into your calendar — 24 hours a day, 7 days a week.
        </p>

        {/* Demo CTA */}
        <div style={{ background: "rgba(91,124,250,0.08)", border: "1px solid rgba(91,124,250,0.2)", borderRadius: "20px", padding: "32px", marginBottom: "40px", display: "inline-block", minWidth: "340px" }}>
          <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#64748b", fontWeight: 500, textTransform: "uppercase", letterSpacing: "1px" }}>📞 Call Sara right now — she's live</p>
          <a href={`tel:${DEMO_NUMBER_TEL}`} style={{ display: "block", fontSize: "2.4rem", fontWeight: 800, color: "#5b7cfa", textDecoration: "none", letterSpacing: "-1px", margin: "0 0 16px" }}>
            {DEMO_NUMBER}
          </a>
          <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#64748b" }}>Try to book an appointment. Ask her a question. Try to stump her.</p>
          <a href={`tel:${DEMO_NUMBER_TEL}`} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #5b7cfa, #7c3aed)", color: "#fff", padding: "14px 28px", borderRadius: "12px", fontSize: "15px", fontWeight: 700, textDecoration: "none", boxShadow: "0 8px 32px rgba(91,124,250,0.35)" }}>
            📞 Call the Demo Now
          </a>
        </div>

        <div style={{ marginTop: "20px" }}>
          <SignUpButton mode="modal">
            <button style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f1f5f9", padding: "14px 28px", borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}>
              Start Free — First 30 Days On Us →
            </button>
          </SignUpButton>
        </div>
      </section>

      {/* ── Social Proof Numbers ── */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "40px 2rem" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "64px", flexWrap: "wrap", maxWidth: "800px", margin: "0 auto" }}>
          {[
            { n: "<200ms", label: "Response time" },
            { n: "24/7", label: "Always answering" },
            { n: "100%", label: "Calls captured" },
            { n: "$0", label: "Setup fee" },
          ].map(({ n, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#5b7cfa", letterSpacing: "-1px" }}>{n}</div>
              <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: "80px 2rem", maxWidth: "900px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 800, letterSpacing: "-1px", marginBottom: "16px" }}>Up and running in 5 minutes</h2>
        <p style={{ textAlign: "center", color: "#64748b", marginBottom: "56px" }}>No IT team. No long-term contract. No learning curve.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
          {[
            { step: "01", icon: "📲", title: "Forward your number", desc: "Dial *71 + your new Sara number. Takes 60 seconds. Your existing business number stays the same." },
            { step: "02", icon: "🎙️", title: "Sara answers every call", desc: "Instantly. In under 200ms. She sounds warm, professional, and completely natural — callers don't know she's AI." },
            { step: "03", icon: "📅", title: "Appointments booked automatically", desc: "Sara checks availability and books jobs directly into your calendar. You get notified in real time." },
            { step: "04", icon: "📊", title: "Every call in your CRM", desc: "Full transcripts, AI summaries, and contact records — all saved automatically. Never lose a lead again." },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "28px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#5b7cfa", letterSpacing: "2px", marginBottom: "12px" }}>STEP {step}</div>
              <div style={{ fontSize: "28px", marginBottom: "12px" }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}>{title}</div>
              <div style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Who It's For ── */}
      <section style={{ padding: "0 2rem 80px", maxWidth: "900px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 800, letterSpacing: "-1px", marginBottom: "40px" }}>Built for local service businesses</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
          {["🔧 Plumbers", "❄️ HVAC", "🏠 Contractors", "💉 MedSpas", "🦷 Dentists", "⚖️ Law Firms", "🚗 Auto Shops", "🌿 Landscapers", "🐾 Vet Clinics", "💆 Chiropractors"].map((biz) => (
            <div key={biz} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "100px", padding: "10px 20px", fontSize: "14px", fontWeight: 500 }}>{biz}</div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ padding: "0 2rem 80px", maxWidth: "900px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 800, letterSpacing: "-1px", marginBottom: "16px" }}>Simple, honest pricing</h2>
        <p style={{ textAlign: "center", color: "#64748b", marginBottom: "48px" }}>One missed job pays for a full year of Sara.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
          {[
            {
              name: "Starter",
              price: "$149",
              period: "/month",
              desc: "Perfect for getting started",
              features: ["Up to 200 call minutes/month", "Full CRM (Contacts, Call Logs)", "Appointment booking", "Email summaries", "Cancel anytime"],
              highlight: false,
            },
            {
              name: "Professional",
              price: "$299",
              period: "/month",
              desc: "Most popular — everything you need",
              features: ["Up to 500 call minutes/month", "Full CRM + SMS messages", "Lead pipeline tracking", "Custom knowledge base", "Priority support", "Cancel anytime"],
              highlight: true,
            },
            {
              name: "Growth",
              price: "$599",
              period: "/month",
              desc: "For high-volume businesses",
              features: ["Up to 1,200 call minutes/month", "Everything in Professional", "Multiple locations", "Custom AI voice & name", "Dedicated onboarding call"],
              highlight: false,
            },
          ].map(({ name, price, period, desc, features, highlight }) => (
            <div key={name} style={{ background: highlight ? "linear-gradient(135deg, rgba(91,124,250,0.12), rgba(124,58,237,0.08))" : "rgba(255,255,255,0.03)", border: highlight ? "1px solid rgba(91,124,250,0.4)" : "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "32px", position: "relative" }}>
              {highlight && <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #5b7cfa, #7c3aed)", color: "#fff", padding: "4px 16px", borderRadius: "100px", fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap" }}>MOST POPULAR</div>}
              <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "4px" }}>{name}</div>
              <div style={{ color: "#64748b", fontSize: "13px", marginBottom: "24px" }}>{desc}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "28px" }}>
                <span style={{ fontSize: "2.8rem", fontWeight: 800, letterSpacing: "-2px" }}>{price}</span>
                <span style={{ color: "#64748b", fontSize: "14px" }}>{period}</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#94a3b8" }}>
                    <span style={{ color: "#5b7cfa", fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <SignUpButton mode="modal">
                <button style={{ width: "100%", padding: "13px", borderRadius: "10px", background: highlight ? "linear-gradient(135deg, #5b7cfa, #7c3aed)" : "rgba(255,255,255,0.06)", border: highlight ? "none" : "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                  Start Free Trial
                </button>
              </SignUpButton>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: "80px 2rem", textAlign: "center", background: "linear-gradient(135deg, rgba(91,124,250,0.08), rgba(124,58,237,0.05))", borderTop: "1px solid rgba(91,124,250,0.15)" }}>
        <h2 style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-1.5px", marginBottom: "16px" }}>
          Ready to stop missing calls?
        </h2>
        <p style={{ color: "#64748b", marginBottom: "40px", fontSize: "1.1rem" }}>First 30 days are completely free. No credit card required.</p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href={`tel:${DEMO_NUMBER_TEL}`} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #5b7cfa, #7c3aed)", color: "#fff", padding: "16px 32px", borderRadius: "12px", fontSize: "16px", fontWeight: 700, textDecoration: "none", boxShadow: "0 8px 32px rgba(91,124,250,0.35)" }}>
            📞 Call the Demo: {DEMO_NUMBER}
          </a>
          <SignUpButton mode="modal">
            <button style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#f1f5f9", padding: "16px 32px", borderRadius: "12px", fontSize: "16px", fontWeight: 600, cursor: "pointer" }}>
              Create Free Account →
            </button>
          </SignUpButton>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: "32px 2rem", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ fontSize: "13px", color: "#475569" }}>© 2026 Solomon's Logic LLC · Nashville, TN</div>
        <div style={{ display: "flex", gap: "24px" }}>
          <Link href="/sign-in" style={{ fontSize: "13px", color: "#475569", textDecoration: "none" }}>Sign In</Link>
          <a href="mailto:mike@solomonslogic.com" style={{ fontSize: "13px", color: "#475569", textDecoration: "none" }}>Contact</a>
        </div>
      </footer>
    </div>
  );
}

// ─── Dashboard (for signed-in users) ─────────────────────────────────────────
function Dashboard() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const router = useRouter();

  useEffect(() => {
    void fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data: DashboardData) => {
        setStats(data);
        if (!data.businessPhone || !data.firstName || !data.lastName || !data.businessName) {
          router.push("/onboarding");
        }
      })
      .catch(() => setStats(null));
  }, [router]);

  return (
    <AppShell
      title="Dashboard"
      subtitle="Solomon's Logic CRM Overview"
      action={
        <Link
          href="/ai-receptionist"
          className="rounded-md bg-[#355cc9] px-3 py-2 text-sm font-medium text-white hover:bg-[#456ce0]"
        >
          AI Receptionist
        </Link>
      }
    >
      {stats && (!stats.businessPhone || !stats.firstName || !stats.lastName || !stats.businessName) && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-200">
          <div className="flex items-center gap-3">
            <span className="text-lg">ℹ️</span>
            <div>
              <span className="font-semibold">Complete your profile.</span> Add your contact info and business details to activate your AI receptionist.
            </div>
          </div>
          <Link href="/settings" className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500">
            Go to Settings
          </Link>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <MetricCard label="Total Contacts" value={stats?.totalContacts ?? 0} icon="C" />
        <MetricCard label="Active Leads" value={stats?.totalLeads ?? 0} subvalue="0 won" icon="L" />
        <MetricCard label="Pipeline Value" value="$1k" icon="$" />
        <MetricCard label="Today's Appointments" value={stats?.totalAppointments ?? 0} icon="A" />
        <MetricCard label="Upcoming Appointments" value={stats?.upcomingAppointmentsCount ?? 0} icon="U" />
        <MetricCard label="Calls (30d)" value={stats?.recentCalls ?? 0} icon="P" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Surface className="overflow-hidden">
          <div className="border-b border-white/5 px-5 py-4">
            <h2 className="text-[14px] font-semibold">Upcoming Appointments</h2>
          </div>
          {stats?.upcomingAppointments.length ? (
            <div className="divide-y divide-white/5">
              {stats.upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-100">{appointment.title}</div>
                    <div className="mt-1 text-xs text-zinc-400">{appointment.contact?.fullName ?? "Unassigned contact"}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-medium text-zinc-100">{formatDateTime(appointment.startTime)}</div>
                    <div className="mt-1 text-xs text-zinc-500">{appointment.durationMinutes} min</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5">
              <EmptyState title="No upcoming appointments" description="Bookings will appear here once the receptionist creates them." />
            </div>
          )}
        </Surface>

        <Surface className="overflow-hidden">
          <div className="border-b border-white/5 px-5 py-4">
            <h2 className="text-[14px] font-semibold">Recent Calls</h2>
          </div>
          {stats?.recentCallItems.length ? (
            <div className="divide-y divide-white/5">
              {stats.recentCallItems.map((call) => (
                <div key={call.id} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-100">{call.contact?.fullName ?? call.callerPhone}</div>
                    <div className="mt-1 text-xs text-zinc-400">{call.direction} call</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-medium text-zinc-100">{formatDuration(call.durationSeconds)}</div>
                    <div className="mt-1 text-xs text-zinc-500">{formatDateTime(call.calledAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5">
              <EmptyState title="No recent calls" description="Inbound and outbound call activity will populate here." />
            </div>
          )}
        </Surface>
      </div>
    </AppShell>
  );
}

// ─── Root: smart router ───────────────────────────────────────────────────────
export default function Home() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#0a0c14" }}>
        <div style={{ width: "32px", height: "32px", border: "2px solid #5b7cfa", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  return isSignedIn ? <Dashboard /> : <LandingPage />;
}
