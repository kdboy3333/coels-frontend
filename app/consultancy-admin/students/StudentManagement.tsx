"use client";

import { useState } from "react";

type Student = {
  id: number;
  name: string;
  username: string;
  programme: string;
  intake: string;
  status: "Active" | "Inactive";
};

const initialStudents: Student[] = [
  {
    id: 1,
    name: "Approved Applicant",
    username: "approved.applicant",
    programme: "Certificate in Cyber Security",
    intake: "2025/2026 First Intake",
    status: "Active",
  },
];

export default function StudentManagement() {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState("");

  function toggleStatus(id: number) {
    setStudents(
      students.map((student) =>
        student.id === id
          ? {
              ...student,
              status:
                student.status === "Active" ? "Inactive" : "Active",
            }
          : student
      )
    );
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.username.toLowerCase().includes(search.toLowerCase()) ||
      student.programme.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Consultancy Student Records
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Search and manage students enrolled through Consultancy Services.
        </p>

        <div className="mt-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, username or programme"
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredStudents.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              No consultancy students found.
            </p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div
              key={student.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#102A43]">
                    {student.name}
                  </h3>

                  <p className="mt-2 text-sm text-slate-600">
                    Username: {student.username}
                  </p>

                  <p className="text-sm text-slate-600">
                    Programme: {student.programme}
                  </p>

                  <p className="text-sm text-slate-600">
                    Intake: {student.intake}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleStatus(student.id)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${
                    student.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {student.status}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-bold text-[#102A43]">
          Consultancy Student Rules
        </h2>

        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
          <li>• Consultancy students are separate from main COELS students.</li>
          <li>• Each student belongs to a consultancy programme.</li>
          <li>• Each student belongs to an intake.</li>
          <li>• Consultancy Admin can activate or deactivate accounts.</li>
          <li>• Student records will be stored permanently in the backend.</li>
        </ul>
      </div>
    </section>
  );
}