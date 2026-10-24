"use client";

import { useState } from "react";

export default function SessionForm() {
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-extrabold text-[#102A43]">
        Academic Session
      </h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <input
          required
          type="text"
          placeholder="Example: 2025/2026"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-[#102A43] px-5 py-3 font-bold text-white"
        >
          Save Session
        </button>

        {saved && (
          <p className="text-sm text-slate-600">
            Session interface is ready for backend connection.
          </p>
        )}
      </form>
    </div>
  );
}