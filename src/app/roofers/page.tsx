import Link from "next/link";
import { ArrowRight, PhoneMissed, CalendarCheck, Clock, ShieldCheck, CloudLightning, FileText, Zap } from "lucide-react";

export const metadata = {
  title: "AI Receptionist for Roofers | Solomon's Logic",
  description:
    "Storm season is your busiest time — don't lose jobs to voicemail. Solomon's Logic AI Receptionist answers every call 24/7, handles insurance claim inquiries, and books roofing estimates automatically.",
  keywords: "AI receptionist for roofers, roofing company answering service, storm damage call answering, roofing CRM, Sara AI",
  openGraph: {
    title: "AI Receptionist for Roofers | Solomon's Logic",
    description:
      "When a hailstorm hits Nashville, 50 homeowners call at once. Sara answers all of them — 24/7, no voicemail, no missed jobs.",
  },
};

export default function RoofersLandingPage() {
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
            Built for Roofing Contractors
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400">
            Storm Season Is Your Busiest Time. Don&apos;t Lose Jobs to Voicemail.
          </h1>
          <p className="text-lg lg:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            When a hailstorm hits Nashville, 50 homeowners call at once. Sara answers all of them — 24/7,
            with no hold music, no voicemail, and no missed emergency jobs.
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
              When a hailstorm hits Nashville, 50 homeowners call at once. Sara answers all of them.
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Storm season is a gold rush — but only for the roofer who picks up. Most homeowners call 3–5 companies
              and hire the first one that answers. Don&apos;t let your competitor win the job because you went to voicemail.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-xl border border-red-500/10 bg-red-500/5">
                <PhoneMissed className="w-6 h-6 text-red-400 shrink-0" />
                <div>
                  <h3 className="font-semibold text-zinc-200">The Old Way: Missed Calls</h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    Your phone rings 40 times during a storm. You answer 8. The other 32 homeowners call your competitor
                    and you lose thousands in revenue.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="font-semibold text-zinc-200">The New Way: Solomon&apos;s Logic</h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    Sara handles unlimited simultaneous calls. Every homeowner gets a live human-sounding answer, an
                    empathetic response, and a scheduled inspection — instantly.
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
                  Hi, thanks for calling Storm Shield Roofing. This is Sara — how can I help you today?
                </p>
              </div>
              {/* Customer */}
              <div className="flex gap-3 flex-row-reverse">
                <div className="h-6 w-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  C
                </div>
                <p className="bg-[#355cc9] rounded-2xl rounded-tr-none px-4 py-2 text-white">
                  The hailstorm last night destroyed my roof. I&apos;ve got water coming in through my ceiling and I need
                  someone out here ASAP. My insurance company said I need to file a claim.
                </p>
              </div>
              {/* Sara */}
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-[#355cc9] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  S
                </div>
                <p className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-2 text-zinc-300">
                  Oh no, I&apos;m so sorry — that&apos;s really stressful. We can absolutely help with both the emergency tarping
                  and your insurance inspection. Can I get your address? I&apos;ll get a crew scheduled for you today.
                </p>
              </div>
              {/* Customer */}
              <div className="flex gap-3 flex-row-reverse">
                <div className="h-6 w-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  C
                </div>
                <p className="bg-[#355cc9] rounded-2xl rounded-tr-none px-4 py-2 text-white">
                  Yes, it&apos;s 142 Maple Drive, Nashville. Thank you so much!
                </p>
              </div>
              {/* Sara */}
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-[#355cc9] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  S
                </div>
                <p className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-2 text-zinc-300">
                  Perfect. I&apos;ve got you scheduled for this afternoon between 2 and 4 PM. You&apos;ll receive a confirmation
                  text shortly. You&apos;re in good hands!
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
            <h2 className="text-3xl font-bold">Everything Your Front Office Needs, Automated</h2>
            <p className="mt-4 text-zinc-400">
              From storm-season surges to insurance paperwork inquiries — Sara handles it all.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: CloudLightning,
                title: "Storm Surge Ready",
                desc: "Sara handles unlimited simultaneous calls. When 50 homeowners call after a storm, every single one gets answered on the first ring.",
              },
              {
                icon: FileText,
                title: "Insurance Claim Guidance",
                desc: "Sara knows to capture the right info — type of damage, insurance carrier, and urgency level — so your crew arrives prepared.",
              },
              {
                icon: CalendarCheck,
                title: "Instant Inspection Booking",
                desc: "She schedules roof inspections and emergency tarp jobs directly into your calendar with zero back-and-forth.",
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

      {/* Social Proof / Stats */}
      <section className="px-6 py-16 lg:px-12 bg-white/[0.02] border-y border-white/5">
        <div className="mx-auto max-w-6xl grid md:grid-cols-3 gap-8 text-center">
          {[
            { stat: "24/7", label: "Always answering — nights, weekends, and storm season" },
            { stat: "$0", label: "Missed call cost when Sara answers every ring" },
            { stat: "3 min", label: "Setup time. Forward your calls and you're live." },
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
            Ready when the next storm hits
          </div>
          <h2 className="text-4xl font-bold">Be the roofer that always picks up.</h2>
          <p className="text-zinc-400 max-w-md mx-auto">
            Get your dedicated AI phone line in 3 minutes. Forward your calls to Sara and never miss a storm-season
            lead again.
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
