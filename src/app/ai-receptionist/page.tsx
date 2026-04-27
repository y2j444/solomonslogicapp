import Link from "next/link";
import { AppShell, Surface } from "@/components/app-shell";

const endpoints = [
  {
    label: "Vapi booking webhook",
    href: "/api/webhooks/vapi/book",
    description: "Creates contacts, appointments, and call logs from tool calls.",
  },
  {
    label: "Twilio SMS webhook",
    href: "/api/webhooks/twilio/sms",
    description: "Processes inbound text messages.",
  },
  {
    label: "Twilio call webhook",
    href: "/api/webhooks/twilio/call",
    description: "Handles inbound call routing and logging.",
  },
];

export default function AiReceptionistPage() {
  return (
    <AppShell
      title="AI Receptionist"
      subtitle="Voice + SMS automation"
      action={
        <Link
          href="/api/webhooks/vapi/book"
          className="rounded-md bg-[#355cc9] px-3 py-2 text-sm font-medium text-white hover:bg-[#456ce0]"
        >
          Test webhook
        </Link>
      }
    >
      <div className="grid gap-4 xl:grid-cols-3">
        {endpoints.map((endpoint) => (
          <Surface key={endpoint.label} className="p-5">
            <div className="text-sm font-semibold">{endpoint.label}</div>
            <p className="mt-2 text-sm text-zinc-500">{endpoint.description}</p>
            <Link
              href={endpoint.href}
              className="mt-4 inline-flex rounded-md bg-white/5 px-3 py-2 text-sm text-zinc-200 hover:bg-white/10"
            >
              Open endpoint
            </Link>
          </Surface>
        ))}
      </div>

      <Surface className="mt-4 p-5">
        <h2 className="text-sm font-semibold">Recommended flow</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-zinc-400">
          <li>Vapi receives the call and triggers the booking tool.</li>
          <li>The webhook resolves the business by Twilio number.</li>
          <li>A contact and appointment are created if needed.</li>
          <li>The call log is written for follow-up and reporting.</li>
        </ol>
      </Surface>
    </AppShell>
  );
}