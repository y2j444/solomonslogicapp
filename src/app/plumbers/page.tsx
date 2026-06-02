import Link from "next/link";
import { ArrowRight, PhoneMissed, CalendarCheck, Clock, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "AI Receptionist for Plumbers | Solomon's Logic",
  description: "Stop losing emergency leak jobs to missed calls. Solomon's Logic provides a 24/7 AI Receptionist that sounds human, answers instantly, and books plumbing jobs directly into your calendar.",
};

export default function PlumbersLandingPage() {
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
          <Link href="/sign-in" className="text-sm font-medium text-zinc-400 hover:text-white transition">Sign In</Link>
          <Link href="/onboarding" className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-24 lg:px-12 lg:py-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#355cc9] to-transparent blur-[100px] rounded-full mix-blend-screen" />
        </div>
        
        <div className="relative mx-auto max-w-4xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#355cc9]/30 bg-[#355cc9]/10 px-3 py-1 text-xs font-semibold text-[#5b7cfa]">
            <span className="flex h-2 w-2 rounded-full bg-[#5b7cfa] animate-pulse" />
            Built for Plumbing Contractors
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400">
            Stop Losing Emergency Jobs to Missed Calls.
          </h1>
          <p className="text-lg lg:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            When a pipe bursts at 2 AM, they call until someone answers. Our AI receptionist answers your phone 24/7, sounds completely human, and books the job directly into your calendar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/onboarding" className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#355cc9] px-8 py-4 text-sm font-bold text-white shadow-xl shadow-blue-500/20 hover:bg-[#456ce0] transition-all hover:scale-105 active:scale-95">
              Hire Sara for $199/mo <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="tel:+16157163328" className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold text-white hover:bg-white/10 transition-all">
              Call (615) 716-3328 to Hear Her
            </a>
          </div>
          <p className="text-xs text-zinc-500 mt-4">Takes 3 minutes to set up. Cancel anytime.</p>
        </div>
      </section>

      {/* The Problem / Solution Section */}
      <section className="px-6 py-20 lg:px-12 bg-white/[0.02] border-y border-white/5">
        <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">You're under a sink. Your phone is ringing. What happens?</h2>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-xl border border-red-500/10 bg-red-500/5">
                <PhoneMissed className="w-6 h-6 text-red-400 shrink-0" />
                <div>
                  <h3 className="font-semibold text-zinc-200">The Old Way: Voicemail</h3>
                  <p className="text-sm text-zinc-400 mt-1">They don't leave a message. They hang up and call the next plumber on Google. You just lost a $400+ job.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="font-semibold text-zinc-200">The New Way: Solomon's Logic</h3>
                  <p className="text-sm text-zinc-400 mt-1">Sara picks up on the first ring. "Hi, thanks for calling Peak Flow Plumbing, this is Sara, how can I help?" She gets the address, the problem, and books the dispatch.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-2xl border border-white/10 bg-[#16192a] p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#355cc9]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h3 className="font-semibold mb-4 text-zinc-300 text-sm uppercase tracking-wider">Live Call Transcript</h3>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-[#355cc9] flex items-center justify-center text-[10px] font-bold text-white shrink-0">S</div>
                <p className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-2 text-zinc-300">Hi, thanks for calling Mike's Plumbing. This is Sara. How can I help you today?</p>
              </div>
              <div className="flex gap-3 flex-row-reverse">
                <div className="h-6 w-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0">C</div>
                <p className="bg-[#355cc9] rounded-2xl rounded-tr-none px-4 py-2 text-white">My water heater is leaking all over my garage, I need someone out here now!</p>
              </div>
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-[#355cc9] flex items-center justify-center text-[10px] font-bold text-white shrink-0">S</div>
                <p className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-2 text-zinc-300">Oh no, I'm so sorry to hear that. I can get a tech out to you within the hour. Let me grab your address and name real quick.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Built to Run Your Front Office</h2>
            <p className="mt-4 text-zinc-400">Everything a real human dispatcher does, at a fraction of the cost.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Clock, title: "Answers 24/7", desc: "Nights, weekends, holidays. Sara never sleeps, never takes a break, and never calls out sick." },
              { icon: CalendarCheck, title: "Books Appointments", desc: "She checks your live availability and books jobs straight into your dashboard or CRM." },
              { icon: PhoneMissed, title: "Zero Missed Leads", desc: "Every caller talks to a friendly human-sounding voice instantly. Zero hold times." },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 hover:bg-white/5 transition-colors">
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

      {/* CTA Footer */}
      <section className="px-6 py-24 lg:px-12 border-t border-white/5 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to stop missing jobs?</h2>
        <p className="text-zinc-400 mb-8 max-w-md mx-auto">Get your dedicated AI phone number in 3 minutes. Just forward your calls and you're done.</p>
        <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-xl bg-[#355cc9] px-8 py-4 text-sm font-bold text-white shadow-xl shadow-blue-500/20 hover:bg-[#456ce0] transition-all hover:scale-105 active:scale-95">
          Start for $199/month
        </Link>
      </section>
    </div>
  );
}
