"use client";

import { useState } from "react";

type Report = {
  name: string;
  description: string;
};

const reports: Report[] = [
  {
    name: "Student Report",
    description:
      "View students by programme, school, department, level and academic session.",
  },
  {
    name: "Applicant & Admission Report",
    description:
      "Review applications, admission decisions and admission status.",
  },
  {
    name: "Registration Report",
    description:
      "Review course registrations, registration status and registered courses.",
  },
  {
    name: "Results Report",
    description:
      "Review student results, grades, grade points and class performance.",
  },
  {
    name: "Finance & Payment Report",
    description:
      "Review fees, payments, payment status, references and outstanding records.",
  },
  {
    name: "Fee Structure Report",
    description:
      "Review fees configured for programmes, schools, departments, levels and sessions.",
  },
  {
    name: "Staff Report",
    description:
      "Review lecturers, HODs and authorised staff by school, department and role.",
  },
  {
    name: "Academic Structure Report",
    description:
      "Review programmes, schools, departments and courses.",
  },
];

export default function ReportsManagement() {
  const [, setSelectedReport] = useState("");
  const [message, setMessage] = useState("");

  function generateReport(name: string) {
    setSelectedReport(name);
    setMessage(`${name} selected. Report generation will connect to the backend.`);
  }

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Report Centre
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Select a report category to review institutional records. Backend
          filtering, PDF generation and Excel export will be connected later.
        </p>

        {message && (
          <div className="mt-5 rounded-lg bg-slate-100 px-4 py-3 text-sm font-medium text-[#102A43]">
            {message}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {reports.map((report) => (
          <div
            key={report.name}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-xl font-bold text-[#102A43]">
              {report.name}
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {report.description}
            </p>

            <button
              type="button"
              onClick={() => generateReport(report.name)}
              className="mt-5 rounded-lg bg-[#102A43] px-5 py-3 text-sm font-semibold text-white hover:bg-[#243B53]"
            >
              Generate Report
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-bold text-[#102A43]">
          Report Management Rules
        </h2>

        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
          <li>• Reports are generated from authorised system records.</li>
          <li>• Administrators can filter reports by academic session.</li>
          <li>• Reports can be filtered by programme, school, department and level.</li>
          <li>• Finance reports include payment references and payment status.</li>
          <li>• Result reports include grades and grade points.</li>
          <li>• Student reports contain official student records.</li>
          <li>• Staff access to reports is restricted according to permissions.</li>
          <li>• PDF and Excel export will be connected to the backend.</li>
          <li>• Sensitive reports should be recorded in the audit log.</li>
        </ul>
      </div>
    </section>
  );
}