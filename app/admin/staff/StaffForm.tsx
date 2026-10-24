"use client";

import { useState } from "react";

export default function StaffForm() {
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#C9A227]">
        Staff Account
      </p>

      <h2 className="mt-2 text-2xl font-extrabold text-[#102A43]">
        Add Staff
      </h2>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <input
          required
          type="text"
          placeholder="Full name"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
        />

        <input
          required
          type="email"
          placeholder="Email address"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
        />

        <select
          required
          defaultValue=""
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#102A43]"
        >
          <option value="" disabled>
            Select role
          </option>
          <option>Lecturer</option>
          <option>HOD</option>
          <option>Registry Staff</option>
          <option>Bursary Staff</option>
          <option>Administrative Staff</option>
          <option>Other Staff</option>
        </select>

        <input
          type="text"
          placeholder="School"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
        />

        <input
          type="text"
          placeholder="Department"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-[#102A43] px-6 py-3 font-bold text-white hover:bg-[#243B53]"
        >
          Create Staff Account
        </button>

        {saved && (
          <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
            Staff creation interface is ready. Account creation and email
            delivery will be connected to the backend.
          </p>
        )}
      </form>
    </div>
  );
}