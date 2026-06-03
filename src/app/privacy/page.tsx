import React from "react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 py-16 px-6 sm:px-12 lg:px-24">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="border-b border-zinc-800 pb-8">
          <Link href="/" className="text-blue-500 hover:text-blue-400 font-medium mb-8 inline-block">
            &larr; Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-zinc-500">Last Updated: June 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">1. Introduction</h2>
          <p>
            Welcome to Solomon's Logic. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">2. The Data We Collect About You</h2>
          <p>
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data</strong> includes billing address, email address and telephone numbers.</li>
            <li><strong>Technical Data</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location.</li>
          </ul>
        </section>

        <section className="space-y-4 bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h2 className="text-2xl font-semibold text-white">3. SMS & Mobile Information (10DLC Compliance)</h2>
          <p className="font-medium text-emerald-400">
            No mobile information will be shared with third parties/affiliates for marketing/promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.
          </p>
          <p>
            When you opt-in to receive SMS messages from Solomon's Logic, we strictly use this consent to communicate with you regarding your inquiries, account status, and requested services. We do not sell, rent, or trade your phone number.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">4. How We Use Your Data</h2>
          <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal or regulatory obligation.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">5. Contact Details</h2>
          <p>
            If you have any questions about this privacy policy or our privacy practices, please contact us at:
            <br />
            Email: privacy@solomonslogic.com
            <br />
            Phone: (615) 716-3328
          </p>
        </section>

      </div>
    </div>
  );
}
