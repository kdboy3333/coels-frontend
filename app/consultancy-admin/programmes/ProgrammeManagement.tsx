"use client";

import { useState } from "react";

type Programme = {
  id: number;
  name: string;
  status: "Active" | "Inactive";
};

const initialProgrammes: Programme[] = [
  { id: 1, name: "Advanced Diploma in Legal Studies", status: "Active" },
  { id: 2, name: "Advanced Diploma in Public Administration", status: "Active" },
  {
    id: 3,
    name: "Advanced Diploma in Local Government Administration",
    status: "Active",
  },
  { id: 4, name: "Advanced Diploma in Qur’anic Science", status: "Active" },
  {
    id: 5,
    name: "Professional Diploma in Education (PDE-TRCN)",
    status: "Active",
  },
  {
    id: 6,
    name: "Professional Diploma in Criminology and Security Studies",
    status: "Active",
  },
  {
    id: 7,
    name: "Professional Diploma in Cyber Security",
    status: "Active",
  },
  {
    id: 8,
    name: "Professional Diploma in Local Government Administration",
    status: "Active",
  },
  {
    id: 9,
    name: "Professional Diploma in English Language Proficiency",
    status: "Active",
  },
  {
    id: 10,
    name: "Professional Diploma in Arabic Language Proficiency",
    status: "Active",
  },
  {
    id: 11,
    name: "Professional Intermediate Certificate in Arabic Language Proficiency",
    status: "Active",
  },
  {
    id: 12,
    name: "Professional Intermediate Certificate in English Language Proficiency",
    status: "Active",
  },
  {
    id: 13,
    name: "Professional Basic Certificate in Arabic Language Proficiency",
    status: "Active",
  },
  {
    id: 14,
    name: "Professional Basic Certificate in French Language Proficiency",
    status: "Active",
  },
  {
    id: 15,
    name: "Professional Certificate in Ulumu Qur’an",
    status: "Active",
  },
  { id: 16, name: "Professional Certificate in Qira’at", status: "Active" },
  { id: 17, name: "Professional Certificate in Tafsir", status: "Active" },
  { id: 18, name: "Certificate in Data Science", status: "Active" },
  { id: 19, name: "Certificate in Cyber Security", status: "Active" },
  { id: 20, name: "Certificate in Computer Applications", status: "Active" },
  {
    id: 21,
    name: "Certificate in Computer Applications Arabic Medium",
    status: "Active",
  },
];

export default function ProgrammeManagement() {
  const [programmes, setProgrammes] = useState(initialProgrammes);
  const [name, setName] = useState("");

  function addProgramme() {
    if (!name.trim()) return;

    setProgrammes([
      ...programmes,
      {
        id: Date.now(),
        name: name.trim(),
        status: "Active",
      },
    ]);

    setName("");
  }

  function toggleStatus(id: number) {
    setProgrammes(
      programmes.map((programme) =>
        programme.id === id
          ? {
              ...programme,
              status:
                programme.status === "Active" ? "Inactive" : "Active",
            }
          : programme
      )
    );
  }

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Add Consultancy Programme
        </h2>

        <div className="mt-6 flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter programme name"
            className="flex-1 rounded-lg border border-slate-300 px-4 py-3"
          />

          <button
            type="button"
            onClick={addProgramme}
            className="rounded-lg bg-[#102A43] px-6 py-3 font-semibold text-white"
          >
            Add Programme
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Consultancy Programme Records
        </h2>

        <div className="mt-6 space-y-3">
          {programmes.map((programme, index) => (
            <div
              key={programme.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
            >
              <div>
                <span className="mr-2 font-bold text-[#C9A227]">
                  {index + 1}.
                </span>

                <span className="font-semibold text-slate-700">
                  {programme.name}
                </span>
              </div>

              <button
                type="button"
                onClick={() => toggleStatus(programme.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  programme.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {programme.status}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}