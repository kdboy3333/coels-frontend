"use client";

import { useState } from "react";

type Report = {
  id: number;
  name: string;
  description: string;
};

const reports: Report[] = [
  {
    id: 1,
    name: "Student Report",
    description: "View consultancy student records.",
  },
  {
    id: 2,
    name: "Applicant Report",
    description: "View consultancy applicant records.",
  },
  {
    id: 3,
    name: "Admission Report",
    description: "View approved and admitted applicants.",
  },
  {
    id: 4,
    name: "Payment Report",
    description: "View consultancy payment records.",
  },
  {
    id: 5,
    name: "Results Report",
    description: "View consultancy student results.",
  },
  {
    id: 6,
    name: "Programme Report",
    description: "View consultancy programmes and enrolment.",
  },
  {
    id: 7,
    name: "Intake Report",
    description: "View consultancy intake information.",
  },
  {
    id: 8,
    name: "Active / Inactive Report",
    description: "View active and inactive records.",
  },
];

export default function ReportManagement() {
  const [search, setSearch] = useState("");

  const filteredReports = reports.filter(
    (report) =>
      report.name.toLowerCase().includes(search.toLowerCase()) ||
      report.description.toLowerCase().includes(search.toLowerCase())
  );

  function printReport(reportName: string) {
    alert(`Preparing ${reportName} for printing.`);
  }

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Consultancy Reports
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Select a report to view consultancy information.
        </p>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search reports..."
          className="mt-6 w-full rounded-lg border border-slate-300 px-4 py-3"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-xl font-bold text-[#102A43]">
              {report.name}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {report.description}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => printReport(report.name)}
                className="rounded-lg bg-[#102A43] px-5 py-3 font-semibold text-white"
              >
                View / Print
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-bold text-[#102A43]">
          Consultancy Report Rules
        </h2>

        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
          <li>• Reports are limited to Consultancy Services.</li>
          <li>• Reports will use live backend data after Laravel integration.</li>
          <li>• Reports can be searched and filtered.</li>
          <li>• Reports will support printing.</li>
          <li>• Consultancy reports remain separate from main COELS reports.</li>
        </ul>
      </div>
    </section>
  );
}