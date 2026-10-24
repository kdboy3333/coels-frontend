"use client";

import { useState } from "react";

export default function AdmissionForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#C9A227]">
          Start Application
        </p>

        <h2 className="mt-2 text-2xl font-extrabold text-[#102A43]">
          Applicant Registration
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          This form is a frontend starting point. The full application,
          document upload, payment and admission workflow will be connected
          to the COELS backend later.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Full Name
          </label>

          <input
            type="text"
            name="fullName"
            required
            placeholder="Enter your full name"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Email Address
          </label>

          <input
            type="email"
            name="email"
            required
            placeholder="Enter your email address"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Phone Number
          </label>

          <input
            type="tel"
            name="phone"
            required
            placeholder="Enter your phone number"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Programme Type
          </label>

          <select
            name="programmeType"
            required
            defaultValue=""
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#102A43]"
          >
            <option value="" disabled>
              Select programme type
            </option>
            <option value="NCE">NCE</option>
            <option value="ND">ND</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-[#102A43] px-6 py-3 font-bold text-white hover:bg-[#243B53]"
        >
          Begin Application
        </button>

        {submitted && (
          <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-700">
            Application interface is ready. Backend processing will be
            connected in the next development stage.
          </div>
        )}
      </form>
    </div>
  );
}