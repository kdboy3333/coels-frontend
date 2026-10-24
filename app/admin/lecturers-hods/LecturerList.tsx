"use client";

import { useState } from "react";

type Lecturer = {
  id: number;
  name: string;
  email: string;
  username: string;
  school: string;
  department: string;
  role: string;
  status: string;
};

const initialLecturers: Lecturer[] = [
  {
    id: 1,
    name: "Sample Lecturer",
    email: "lecturer@example.com",
    username: "lecturer001",
    school: "School of Science",
    department: "Computer / Integrated Science",
    role: "Lecturer",
    status: "Active",
  },
];

export default function LecturerList() {
  const [lecturers] = useState(initialLecturers);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#102A43]">
            Lecturer Records
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            View lecturers, departments, roles and account status.
          </p>
        </div>

        <button
          type="button"
          className="rounded-xl bg-[#102A43] px-5 py-3 text-sm font-semibold text-white hover:bg-[#243B53]"
        >
          Add Lecturer
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 font-semibold text-[#102A43]">
                Lecturer
              </th>

              <th className="px-4 py-3 font-semibold text-[#102A43]">
                Username
              </th>

              <th className="px-4 py-3 font-semibold text-[#102A43]">
                School
              </th>

              <th className="px-4 py-3 font-semibold text-[#102A43]">
                Department
              </th>

              <th className="px-4 py-3 font-semibold text-[#102A43]">
                Role
              </th>

              <th className="px-4 py-3 font-semibold text-[#102A43]">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {lecturers.map((lecturer) => (
              <tr
                key={lecturer.id}
                className="border-b border-slate-100"
              >
                <td className="px-4 py-4">
                  <div className="font-semibold text-slate-800">
                    {lecturer.name}
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    {lecturer.email}
                  </div>
                </td>

                <td className="px-4 py-4 text-slate-600">
                  {lecturer.username}
                </td>

                <td className="px-4 py-4 text-slate-600">
                  {lecturer.school}
                </td>

                <td className="px-4 py-4 text-slate-600">
                  {lecturer.department}
                </td>

                <td className="px-4 py-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-[#102A43]">
                    {lecturer.role}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    {lecturer.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}