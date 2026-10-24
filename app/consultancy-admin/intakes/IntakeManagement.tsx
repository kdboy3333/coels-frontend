"use client";

import { useState } from "react";

export default function IntakeManagement() {
  const [intakes, setIntakes] = useState([
    {
      id: 1,
      name: "2025/2026 First Intake",
      status: "Active",
    },
  ]);

  const [name, setName] = useState("");

  function addIntake() {
    if (!name.trim()) return;

    setIntakes([
      ...intakes,
      {
        id: Date.now(),
        name,
        status: "Active",
      },
    ]);

    setName("");
  }

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Add Consultancy Intake
        </h2>

        <div className="mt-6 flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 2026/2027 First Intake"
            className="flex-1 rounded-lg border border-slate-300 px-4 py-3"
          />

          <button
            type="button"
            onClick={addIntake}
            className="rounded-lg bg-[#102A43] px-6 py-3 font-semibold text-white"
          >
            Add Intake
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Intake Records
        </h2>

        <div className="mt-6 space-y-3">
          {intakes.map((intake) => (
            <div
              key={intake.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
            >
              <span className="font-semibold text-slate-700">
                {intake.name}
              </span>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                {intake.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}