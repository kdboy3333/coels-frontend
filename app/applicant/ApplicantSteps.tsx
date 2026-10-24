"use client";

import { useState } from "react";

export default function ApplicantForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#C9A227]">
        New Applicant
      </p>

      <h2 className="mt-2 text-2xl font-extrabold text-[#102A43]">
        Create Applicant Account
      </h2>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        Enter your basic information to begin your admission application.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Full Name
          </label>

          <input
            required
            type="text"
            placeholder="Enter your full name"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Email Address
          </label>

          <input
            required
            type="email"
            placeholder="Enter your email address"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Phone Number
          </label>

          <input
            required
            type="tel"
            placeholder="Enter your phone number"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Programme Type
          </label>

          <select
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
          Create Applicant Account
        </button>

        {submitted && (
          <div className="rounded-lg bg-slate-100 p-4 text-sm leading-6 text-slate-600">
            Applicant registration interface is ready. Account creation,
            email verification and database processing will be connected to
            the backend.
          </div>
        )}
      </form>
    </div>
  );
}