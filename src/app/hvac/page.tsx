import Link from "next/link";
import { ArrowRight, PhoneMissed, CalendarCheck, Clock, ShieldCheck, Thermometer, Moon, Zap } from "lucide-react";

export const metadata = {
  title: "AI Receptionist for HVAC Companies | Solomon's Logic",
  description:
    "Never miss an emergency AC breakdown call again. Solomon's Logic AI Receptionist answers 24/7, books service calls instantly, and handles summer surge volume so your HVAC company never loses a job.",
  keywords: "AI receptionist for HVAC, HVAC answering service, AC emergency call answering, HVAC scheduling, Sara AI",
  openGraph: {
    title: "AI Receptionist for HVAC Companies | Solomon's Logic",
    description:
      "A broken AC in Nashville summer is an emergency. Be the HVAC company that picks up — Sara answers every call 24/7.",
  },
};

export default function HvacLandingPage() {
  return (
    <div className="min-h-screen bg-[#11131b] text-zinc-100 selection:bg-[#355cc9]/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-5 lg:px-12 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#355cc9] font-bold text-white shadow-lg shadow-blue-500/20">
            S
          </div>
          <span className="font-bold text-lg tracking-tight">Solomon&apos;s Logic</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium text-zinc-400 hover:text-white transition">
            Sign In
          </Link>
          <Link
            href="/onboarding"
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-24 lg:px-12 lg:py-32 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#355cc9] to-transparent blur-[100px] rounded-full mix-blend-screen" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#355cc9]/30 bg-[#355cc9]/10 px-3 py-1 text-xs font-semibold text-[#5b7cfa]">
            <span className="flex h-2 w-2 rounded-full bg-[#5b7cfa] animate-pulse" />
            Built for HVAC Companies
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400">
            Never Miss an Emergency AC Breakdown Call. Sara Answers 24/7.
          </h1>
          <p className="text-lg lg:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            A broken AC in Nashville summer is an emergency. Homeowners call every HVAC company in town —
            the one that answers first wins the job. Be that company.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#355cc9] px-8 py-4 text-sm font-bold text-white shadow-xl shadow-blue-500/20 hover:bg-[#456ce0] transition-all hover:scale-105 active:scale-95"
            >
              Start for $199/mo <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="tel:+16157163328"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold text-white hover:bg-white/10 transition-all"
            >
              Call (615) 716-3328 to Hear Sara
            </a>
          </div>
          <p className="text-xs text-zinc-500 mt-4">Takes 3 minutes to set up. Cancel anytime.</p>
        </div>
      </section>

      {/* Problem / Solution + Transcript */}
      <section className="px-6 py-20 lg:px-12 bg-white/[0.02] border-y border-white/5">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">
              A broken AC in Nashville summer is an emergency. Be the company that picks up.
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              When temperatures hit 95°F and an AC goes down, that homeowner is not waiting around. They&apos;re
              calling every HVAC company on Google until someone answers. Your phone needs to pick up — every time,
              even at 11 PM on a Saturday.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-xl border border-red-500/10 bg-red-500/5">
                <PhoneMissed className="w-6 h-6 text-red-400 shrink-0" />
                <div>
                  <h3 className="font-semibold text-zinc-200">The Old Way: After-Hours Voicemail</h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    Your after-hours message says &quot;leave a voicemail.&quot; They hang up. They call the next company —
                    who answers — and you lose a $500+ service call plus a potential maintenance contract.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="font-semibold text-zinc-200">The New Way: Solomon&apos;s Logic</h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    Sara answers at 11 PM with the same warmth as 9 AM. She captures the issue, triages urgency,
                    and schedules the dispatch — so your tech wakes up to a full calendar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mock Call Transcript */}
          <div className="rounded-2xl border border-white/10 bg-[#16192a] p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#355cc9]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="font-semibold text-zinc-300 text-sm uppercase tracking-wider">Live Call Transcript</h3>
            </div>
            <div className="space-y-4 text-sm">
              {/* Sara */}
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-[#355cc9] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  S
                </div>
                <p className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-2 text-zinc-300">
                  Hi, thanks for calling Cool Breeze HVAC. This is Sara — how can I help you tonight?
                </p>
              </div>
              {/* Customer */}
              <div className="flex gap-3 flex-row-reverse">
                <div className="h-6 w-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  C
                </div>
                <p className="bg-[#355cc9] rounded-2xl rounded-tr-none px-4 py-2 text-white">
                  My AC stopped working an hour ago and it&apos;s 94 degrees in my house. I have two kids and an elderly
                  mother here. I need someone out tonight — this is an emergency.
                </p>
              </div>
              {/* Sara */}
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-[#355cc9] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  S
                </div>
                <p className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-2 text-zinc-300">
                  I completely understand — that&apos;s a dangerous situation, especially with kids and an elderly family
                  member. I&apos;m flagging this as an emergency dispatch right now. Can I get your address?
                </p>
              </div>
              {/* Customer */}
              <div className="flex gap-3 flex-row-reverse">
                <div className="h-6 w-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  C
                </div>
                <p className="bg-[#355cc9] rounded-2xl rounded-tr-none px-4 py-2 text-white">
                  317 Elm Street, Brentwood. Please hurry — it&apos;s a Carrier unit, about 7 years old.
                </p>
              </div>
              {/* Sara */}
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-[#355cc9] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  S
                </div>
                <p className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-2 text-zinc-300">
                  Got it — 317 Elm Street, Brentwood, Carrier unit. I&apos;ve logged the details and our on-call tech will
                  reach out within 30 minutes. You&apos;re all set!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Your 24/7 HVAC Dispatch Operator</h2>
            <p className="mt-4 text-zinc-400">
              Sara handles everything from summer AC emergencies to winter heating calls — so you never miss a job.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Thermometer,
                title: "Summer Surge Coverage",
                desc: "When temps spike and every AC in the city seems to fail at once, Sara handles unlimited simultaneous calls without breaking a sweat.",
              },
              {
                icon: Moon,
                title: "After-Hours & Weekends",
                desc: "Emergency calls don't respect business hours. Sara answers at 2 AM with the same energy and professionalism as midday Monday.",
              },
              {
                icon: CalendarCheck,
                title: "Smart Triage & Booking",
                desc: "Sara captures unit make/model, symptoms, and urgency level — then books the dispatch straight into your scheduling system.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 hover:bg-white/5 transition-colors"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#355cc9]/20 text-[#5b7cfa]">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="px-6 py-16 lg:px-12 bg-white/[0.02] border-y border-white/5">
        <div className="mx-auto max-w-6xl grid md:grid-cols-3 gap-8 text-center">
          {[
            { stat: "24/7", label: "Answering nights, weekends, and holiday emergency calls" },
            { stat: "< 1s", label: "Time to answer — no hold music, no voicemail" },
            { stat: "$199", label: "Per month — less than one missed service call" },
          ].map((s, i) => (
            <div key={i} className="space-y-2">
              <div className="text-4xl font-extrabold text-[#5b7cfa]">{s.stat}</div>
              <p className="text-sm text-zinc-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="px-6 py-24 lg:px-12 border-t border-white/5 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#355cc9]/30 bg-[#355cc9]/10 px-3 py-1 text-xs font-semibold text-[#5b7cfa]">
            <Zap className="w-3 h-3" />
            Live in 3 minutes
          </div>
          <h2 className="text-4xl font-bold">Be the HVAC company that always picks up.</h2>
          <p className="text-zinc-400 max-w-md mx-auto">
            Forward your calls to Sara and every emergency, every inquiry, and every seasonal tune-up request gets
            answered instantly — 24 hours a day.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#355cc9] px-8 py-4 text-sm font-bold text-white shadow-xl shadow-blue-500/20 hover:bg-[#456ce0] transition-all hover:scale-105 active:scale-95"
            >
              Start for $199/month <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="tel:+16157163328"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold text-white hover:bg-white/10 transition-all"
            >
              Call (615) 716-3328 to Hear Sara
            </a>
          </div>
          <p className="text-xs text-zinc-500">No contracts. Cancel anytime.</p>
        </div>
      </section>
    </div>
  );
}
