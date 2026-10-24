"use client";

import { useState } from "react";

type Student = {
  id: number;
  name: string;
  username: string;
  school: string;
  department: string;
  registrationNumber: string;
  paymentStatus: string;
};

const initialStudents: Student[] = [
  {
    id: 1,
    name: "Sample Student",
    username: "student@example.com",
    school: "School of Science",
    department: "Computer / Integrated Science",
    registrationNumber: "Not Generated",
    paymentStatus: "Pending",
  },
];

export default function StudentList() {
  const [students] = useState(initialStudents);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#102A43]">
          Student Records
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          View student accounts and registration status.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="px-3 py-3">Student</th>
              <th className="px-3 py-3">School</th>
              <th className="px-3 py-3">Department</th>
              <th className="px-3 py-3">Reg. No.</th>
              <th className="px-3 py-3">Fee Status</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b border-slate-100">
                <td className="px-3 py-4">
                  <div className="font-semibold text-slate-800">
                    {student.name}
                  </div>

                  <div className="text-xs text-slate-500">
                    {student.username}
                  </div>
                </td>

                <td className="px-3 py-4">
                  {student.school}
                </td>

                <td className="px-3 py-4">
                  {student.department}
                </td>

                <td className="px-3 py-4 font-semibold">
                  {student.registrationNumber}
                </td>

                <td className="px-3 py-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                    {student.paymentStatus}
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