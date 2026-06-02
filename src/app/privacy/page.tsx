export const metadata = {
  title: "Privacy Policy | Solomon's Logic",
  description: "Privacy Policy for Solomon's Logic AI Receptionist service.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-white">Privacy Policy</h1>
        <p className="text-gray-400 mb-10">Last updated: June 2, 2026</p>

        <section className="space-y-8 text-gray-300 leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">1. Who We Are</h2>
            <p>
              Solomon&apos;s Logic (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the AI Receptionist
              platform available at <a href="https://app.solomonslogic.com" className="text-blue-400 underline">app.solomonslogic.com</a>.
              We provide AI-powered answering, SMS, and appointment-booking services to small businesses.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">2. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Name, email address, and phone number when you sign up</li>
              <li>Business name, industry, and contact preferences</li>
              <li>Call recordings and transcripts processed by our AI</li>
              <li>SMS message content sent to or from your dedicated number</li>
              <li>Payment information processed securely via Stripe</li>
              <li>Usage data and logs to improve service quality</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide and improve our AI Receptionist service</li>
              <li>To send appointment reminders and lead follow-up SMS messages on your behalf</li>
              <li>To process payments and manage your subscription</li>
              <li>To send you service updates and support communications</li>
              <li>To comply with legal obligations</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">4. SMS Messaging</h2>
            <p>
              When you or your customers opt in to receive SMS messages through our platform,
              we use that phone number solely to deliver the messages you&apos;ve requested
              (appointment confirmations, lead follow-ups, etc.).
            </p>
            <p className="mt-2 font-medium text-white">
              Your mobile information will not be sold or shared with third parties for
              promotional or marketing purposes. All SMS opt-out requests (via STOP keyword)
              are honored immediately.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">5. Data Sharing</h2>
            <p>We do not sell your personal data. We share data only with:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Telnyx</strong> — phone number provisioning and SMS delivery</li>
              <li><strong>LiveKit</strong> — real-time voice call infrastructure</li>
              <li><strong>OpenAI</strong> — AI language processing for call and SMS responses</li>
              <li><strong>Deepgram</strong> — speech-to-text transcription</li>
              <li><strong>Stripe</strong> — payment processing</li>
              <li><strong>Supabase</strong> — secure database hosting</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">6. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active or as needed to provide
              services. You may request deletion of your data at any time by contacting us at{" "}
              <a href="mailto:solomonslogic@gmail.com" className="text-blue-400 underline">solomonslogic@gmail.com</a>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">7. Security</h2>
            <p>
              We use industry-standard encryption and security practices to protect your data.
              All data is stored in secure, SOC 2-compliant infrastructure.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">8. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data at any time.
              To exercise these rights, contact us at{" "}
              <a href="mailto:solomonslogic@gmail.com" className="text-blue-400 underline">solomonslogic@gmail.com</a>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">9. Contact Us</h2>
            <p>
              Solomon&apos;s Logic<br />
              Email: <a href="mailto:solomonslogic@gmail.com" className="text-blue-400 underline">solomonslogic@gmail.com</a><br />
              Website: <a href="https://app.solomonslogic.com" className="text-blue-400 underline">app.solomonslogic.com</a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
