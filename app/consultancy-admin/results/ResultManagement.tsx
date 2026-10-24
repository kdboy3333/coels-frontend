"use client";

import { useState } from "react";

type StudentResult = {
  id: number;
  student: string;
  username: string;
  ca: number;
  exam: number;
};

const initialResults: StudentResult[] = [
  {
    id: 1,
    student: "Approved Applicant",
    username: "approved.applicant",
    ca: 24,
    exam: 56,
  },
];

function getGrade(total: number) {
  if (total >= 70) return { grade: "A", point: 5 };
  if (total >= 60) return { grade: "B", point: 4 };
  if (total >= 50) return { grade: "C", point: 3 };
  if (total >= 45) return { grade: "D", point: 2 };
  if (total >= 40) return { grade: "E", point: 1 };
  return { grade: "F", point: 0 };
}

export default function ResultManagement() {
  const [intake, setIntake] = useState("2025/2026 First Intake");
  const [programme, setProgramme] = useState(
    "Certificate in Cyber Security"
  );
  const [course, setCourse] = useState("Introduction to Cyber Security");
  const [results, setResults] = useState(initialResults);

  function updateResult(
    id: number,
    field: "ca" | "exam",
    value: string
  ) {
    const numberValue = Math.max(
      0,
      Number(value) || 0
    );

    setResults(
      results.map((result) =>
        result.id === id
          ? {
              ...result,
              [field]:
                field === "ca"
                  ? Math.min(numberValue, 30)
                  : Math.min(numberValue, 70),
            }
          : result
      )
    );
  }

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Result Selection
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Intake
            </label>

            <select
              value={intake}
              onChange={(e) => setIntake(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            >
              <option>2025/2026 First Intake</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Programme
            </label>

            <select
              value={programme}
              onChange={(e) => setProgramme(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            >
              <option>Certificate in Cyber Security</option>
              <option>Certificate in Data Science</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Course
            </label>

            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            >
              <option>Introduction to Cyber Security</option>
              <option>Computer Applications</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="min-w-[850px] p-6">
          <h2 className="text-2xl font-bold text-[#102A43]">
            Bulk Result Entry
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            CA = 30 marks. Examination = 70 marks. Total = 100 marks.
          </p>

          <table className="mt-6 w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-4 py-4">Student</th>
                <th className="px-4 py-4">CA / 30</th>
                <th className="px-4 py-4">Exam / 70</th>
                <th className="px-4 py-4">Total / 100</th>
                <th className="px-4 py-4">Grade</th>
                <th className="px-4 py-4">Point</th>
              </tr>
            </thead>

            <tbody>
              {results.map((result) => {
                const total = result.ca + result.exam;
                const { grade, point } = getGrade(total);

                return (
                  <tr
                    key={result.id}
                    className="border-b border-slate-100"
                  >
                    <td className="px-4 py-5">
                      <div className="font-semibold text-[#102A43]">
                        {result.student}
                      </div>

                      <div className="text-xs text-slate-500">
                        {result.username}
                      </div>
                    </td>

                    <td className="px-4 py-5">
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={result.ca}
                        onChange={(e) =>
                          updateResult(
                            result.id,
                            "ca",
                            e.target.value
                          )
                        }
                        className="w-24 rounded-lg border border-slate-300 px-3 py-2"
                      />
                    </td>

                    <td className="px-4 py-5">
                      <input
                        type="number"
                        min="0"
                        max="70"
                        value={result.exam}
                        onChange={(e) =>
                          updateResult(
                            result.id,
                            "exam",
                            e.target.value
                          )
                        }
                        className="w-24 rounded-lg border border-slate-300 px-3 py-2"
                      />
                    </td>

                    <td className="px-4 py-5 font-bold">
                      {total}
                    </td>

                    <td className="px-4 py-5 font-bold">
                      {grade}
                    </td>

                    <td className="px-4 py-5 font-bold">
                      {point}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-bold text-[#102A43]">
          Consultancy Result Rules
        </h2>

        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
          <li>• Consultancy results are separate from main COELS results.</li>
          <li>• CA has a maximum of 30 marks.</li>
          <li>• Examination has a maximum of 70 marks.</li>
          <li>• Total is automatically calculated out of 100.</li>
          <li>• Grade and grade point are automatically calculated.</li>
          <li>• Results will later be saved permanently in the backend.</li>
        </ul>
      </div>
    </section>
  );
}