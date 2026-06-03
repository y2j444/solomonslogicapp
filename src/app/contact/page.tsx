"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-900 rounded-xl p-8 border border-zinc-800 shadow-2xl">
        <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Contact Sales
        </h1>
        <p className="text-zinc-400 mb-8">
          Get in touch with our team to learn more about the Solomon's Logic AI Receptionist.
        </p>

        {submitted ? (
          <div className="bg-emerald-900/30 border border-emerald-500/50 p-4 rounded-lg text-emerald-400">
            Thanks! We've received your inquiry and will be in touch shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="flex items-start gap-3 mt-6 mb-6 p-4 bg-zinc-950 rounded-lg border border-zinc-800">
              <input
                type="checkbox"
                id="sms-opt-in"
                required
                className="mt-1 w-4 h-4 rounded border-zinc-600 text-blue-500 focus:ring-blue-500 bg-zinc-800"
              />
              <label htmlFor="sms-opt-in" className="text-xs text-zinc-400 leading-relaxed">
                By checking this box, you agree to receive SMS messages regarding your inquiry from Solomon's Logic. 
                Message frequency varies. Message and data rates may apply. Reply STOP to cancel or HELP for help. 
                View our <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link> and <Link href="/terms" className="text-blue-400 hover:underline">Terms of Service</Link>.
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Submit Inquiry
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
