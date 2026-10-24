"use client";

import { useState } from "react";

type Applicant = {
  id: number;
  name: string;
  programme: string;
  intake: string;
  status: "Approved";
};

type Student = {
  id: string;
  applicant: string;
  username: string;
  programme: string;
  intake: string;
  status: "Account Created";
};

const sampleApplicants: Applicant[] = [
  {
    id: 1,
    name: "Approved Applicant",
    programme: "Certificate in Cyber Security",
    intake: "2025/2026 First Intake",
    status: "Approved",
  },
];

export default function AdmissionManagement() {
  const [applicants, setApplicants] = useState(sampleApplicants);
  const [students, setStudents] = useState<Student[]>([]);

  function createStudentAccount(applicant: Applicant) {
    const exists = students.some(
      (student) => student.applicant === applicant.name
    );

    if (exists) {
      return;
    }

    const newStudent: Student = {
      id: crypto.randomUUID(),
      applicant: applicant.name,
      username: applicant.name.toLowerCase().replace(/\s+/g, "."),
      programme: applicant.programme,
      intake: applicant.intake,
      status: "Account Created",
    };

    setStudents((currentStudents) => [
      ...currentStudents,
      newStudent,
    ]);

    setApplicants((currentApplicants) =>
      currentApplicants.filter(
        (item) => item.id !== applicant.id
      )
    );
  }

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Approved Applicants
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Approved applicants can be converted into consultancy student
          accounts.
        </p>

        <div className="mt-6 space-y-4">
          {applicants.length === 0 ? (
            <p className="text-sm text-slate-500">
              No approved applicants are waiting for admission.
            </p>
          ) : (
            applicants.map((applicant) => (
              <div
                key={applicant.id}
                className="rounded-xl border border-slate-200 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-bold text-[#102A43]">
                      {applicant.name}
                    </h3>

                    <p className="text-sm text-slate-600">
                      Programme: {applicant.programme}
                    </p>

                    <p className="text-sm text-slate-600">
                      Intake: {applicant.intake}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => createStudentAccount(applicant)}
                    className="rounded-lg bg-[#102A43] px-6 py-3 font-semibold text-white"
                  >
                    Create Student Account
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Consultancy Student Accounts
        </h2>

        {students.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">
            No consultancy student accounts have been created yet.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="rounded-xl border border-slate-200 p-5"
              >
                <h3 className="font-bold text-[#102A43]">
                  {student.applicant}
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

                <span className="mt-3 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  {student.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-bold text-[#102A43]">
          Admission Rules
        </h2>

        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
          <li>• Only approved applicants can become students.</li>
          <li>
            • Consultancy student accounts are separate from main COELS
            students.
          </li>
          <li>• Consultancy Admin creates the student account.</li>
          <li>• Registration numbers are not generated by this process.</li>
          <li>
            • Permanent account and payment rules will be connected to the
            backend.
          </li>
        </ul>
      </div>
    </section>
  );
}