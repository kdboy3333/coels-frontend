"use client";

import { useState } from "react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-extrabold text-[#102A43]">
        Send a Message
      </h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <input
          required
          type="text"
          placeholder="Your name"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
        />

        <input
          required
          type="email"
          placeholder="Your email"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
        />

        <input
          required
          type="text"
          placeholder="Subject"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
        />

        <textarea
          required
          rows={6}
          placeholder="Your message"
          className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-[#102A43] px-6 py-3 font-bold text-white hover:bg-[#243B53]"
        >
          Send Message
        </button>

        {sent && (
          <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
            Your message has been received by the interface. Email delivery
            will be connected when the backend is implemented.
          </p>
        )}
      </form>
    </div>
  );
}