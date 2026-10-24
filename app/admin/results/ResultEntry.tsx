"use client";

import { useState } from "react";

export default function ResultEntry() {
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage(
      "Result entry configuration saved. Backend/API connection will be added later."
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#102A43]">
          Result Entry Setup
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Select the academic class and course before entering results for the
          whole class.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
      >
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Academic Session
          </label>

          <select className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#C9A227]">
            <option>2025/2026</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Semester
          </label>

          <select className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#C9A227]">
            <option>First Semester</option>
            <option>Second Semester</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Programme
          </label>

          <select className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#C9A227]">
            <option>NCE</option>
            <option>ND</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            School
          </label>

          <select className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#C9A227]">
            <option>School of Science</option>
            <option>School of Law</option>
            <option>School of Art and Social Sciences</option>
            <option>School of Education</option>
            <option>School of Language</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Department
          </label>

          <input
            type="text"
            placeholder="Enter department"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#C9A227]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Level
          </label>

          <select className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#C9A227]">
            <option>NCE 1</option>
            <option>NCE 2</option>
            <option>NCE 3</option>
            <option>ND 1</option>
            <option>ND 2</option>
          </select>
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Course
          </label>

          <select className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#C9A227]">
            <option>Sample Course - Computer Science</option>
          </select>
        </div>

        <div className="md:col-span-2 lg:col-span-3 flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-xl bg-[#102A43] px-6 py-3 font-semibold text-white hover:bg-[#243B53]"
          >
            Load Class Results
          </button>

          <button
            type="button"
            className="rounded-xl border border-[#102A43] px-6 py-3 font-semibold text-[#102A43] hover:bg-slate-50"
          >
            Upload Excel
          </button>

          <button
            type="button"
            className="rounded-xl border border-[#C9A227] px-6 py-3 font-semibold text-[#102A43] hover:bg-[#C9A227]/10"
          >
            Paste Results
          </button>
        </div>

        {message && (
          <div className="md:col-span-2 lg:col-span-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}
      </form>
    </div>
  );
}