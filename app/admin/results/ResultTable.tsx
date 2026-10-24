"use client";

import { useMemo, useState } from "react";

type StudentResult = {
  id: number;
  name: string;
  registrationNumber: string;
  ca: number;
  exam: number;
};

const initialResults: StudentResult[] = [
  {
    id: 1,
    name: "Sample Student",
    registrationNumber: "COELS/SCI/CIS/2025/001",
    ca: 24,
    exam: 56,
  },
  {
    id: 2,
    name: "Sample Student 2",
    registrationNumber: "COELS/SCI/CIS/2025/002",
    ca: 21,
    exam: 48,
  },
  {
    id: 3,
    name: "Sample Student 3",
    registrationNumber: "COELS/SCI/CIS/2025/003",
    ca: 18,
    exam: 35,
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

export default function ResultTable() {
  const [results, setResults] = useState(initialResults);

  const calculatedResults = useMemo(
    () =>
      results.map((student) => {
        const total = student.ca + student.exam;
        const result = getGrade(total);

        return {
          ...student,
          total,
          grade: result.grade,
          point: result.point,
        };
      }),
    [results]
  );

  function updateMark(
    id: number,
    field: "ca" | "exam",
    value: string
  ) {
    let numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
      numberValue = 0;
    }

    if (field === "ca") {
      numberValue = Math.min(30, Math.max(0, numberValue));
    }

    if (field === "exam") {
      numberValue = Math.min(70, Math.max(0, numberValue));
    }

    setResults((current) =>
      current.map((student) =>
        student.id === id
          ? {
              ...student,
              [field]: numberValue,
            }
          : student
      )
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#102A43]">
            Bulk Result Entry
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Enter CA and examination marks for the whole class.
          </p>
        </div>

        <button
          type="button"
          className="rounded-xl bg-[#102A43] px-5 py-3 text-sm font-semibold text-white hover:bg-[#243B53]"
        >
          Save All Results
        </button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">
            CA
          </p>
          <p className="mt-1 text-lg font-bold text-[#102A43]">30 Marks</p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Examination
          </p>
          <p className="mt-1 text-lg font-bold text-[#102A43]">70 Marks</p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Total
          </p>
          <p className="mt-1 text-lg font-bold text-[#102A43]">100 Marks</p>
        </div>

        <div className="rounded-xl bg-[#C9A227]/10 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Students
          </p>
          <p className="mt-1 text-lg font-bold text-[#102A43]">
            {results.length}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 font-semibold text-[#102A43]">
                Student
              </th>

              <th className="px-4 py-3 font-semibold text-[#102A43]">
                Reg. No.
              </th>

              <th className="px-4 py-3 font-semibold text-[#102A43]">
                CA / 30
              </th>

              <th className="px-4 py-3 font-semibold text-[#102A43]">
                Exam / 70
              </th>

              <th className="px-4 py-3 font-semibold text-[#102A43]">
                Total / 100
              </th>

              <th className="px-4 py-3 font-semibold text-[#102A43]">
                Grade
              </th>

              <th className="px-4 py-3 font-semibold text-[#102A43]">
                Point
              </th>
            </tr>
          </thead>

          <tbody>
            {calculatedResults.map((student) => (
              <tr
                key={student.id}
                className="border-b border-slate-100"
              >
                <td className="px-4 py-4 font-medium text-slate-800">
                  {student.name}
                </td>

                <td className="px-4 py-4 text-slate-600">
                  {student.registrationNumber}
                </td>

                <td className="px-4 py-4">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={student.ca}
                    onChange={(event) =>
                      updateMark(student.id, "ca", event.target.value)
                    }
                    className="w-24 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#C9A227]"
                  />
                </td>

                <td className="px-4 py-4">
                  <input
                    type="number"
                    min="0"
                    max="70"
                    value={student.exam}
                    onChange={(event) =>
                      updateMark(student.id, "exam", event.target.value)
                    }
                    className="w-24 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#C9A227]"
                  />
                </td>

                <td className="px-4 py-4 font-bold text-[#102A43]">
                  {student.total}
                </td>

                <td className="px-4 py-4">
                  <span className="rounded-full bg-[#102A43] px-3 py-1 text-xs font-bold text-white">
                    {student.grade}
                  </span>
                </td>

                <td className="px-4 py-4 font-bold text-[#102A43]">
                  {student.point}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}