"use client";

const modules = [
  "Intakes",
  "Programmes",
  "Courses",
  "Applicants",
  "Admissions",
  "Students",
  "Payments",
  "Results",
];

export default function ConsultancyDashboard() {
  return (
    <section className="space-y-8">
      <div className="grid gap-6 md:grid-cols-4">
        {[
          ["Applicants", "0"],
          ["Students", "0"],
          ["Programmes", "21"],
          ["Pending Payments", "0"],
        ].map(([title, value]) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-semibold text-slate-500">{title}</p>
            <p className="mt-3 text-3xl font-bold text-[#102A43]">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Consultancy Management
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Consultancy is managed independently from the main COELS academic
          portal.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {modules.map((module) => (
            <div
              key={module}
              className="rounded-xl border border-slate-200 bg-slate-50 p-5"
            >
              <h3 className="font-bold text-[#102A43]">{module}</h3>
              <p className="mt-2 text-sm text-slate-600">
                Manage {module.toLowerCase()}.
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-bold text-[#102A43]">
          Consultancy Rules
        </h2>

        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
          <li>• Consultancy has its own administration.</li>
          <li>• Consultancy programmes are independent of NCE and ND.</li>
          <li>• Consultancy courses do not use course codes.</li>
          <li>• Consultancy Admin manages consultancy operations.</li>
          <li>• Main COELS academic records remain separate.</li>
        </ul>
      </div>
    </section>
  );
}