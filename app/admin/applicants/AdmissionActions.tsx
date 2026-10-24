"use client";

export default function AdmissionActions() {
  function goToApplicantRecords() {
    document
      .getElementById("applicant-records")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#102A43]">
        Admission Actions
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        Review each applicant, select an admission decision, add an
        optional note, and save it to the admissions database.
      </p>

      <div className="mt-5 space-y-3">
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="font-semibold text-slate-800">
            Available decisions
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
            <li>Pending</li>
            <li>Under Review</li>
            <li>Approved</li>
            <li>Rejected</li>
          </ul>
        </div>

        <button
          type="button"
          onClick={goToApplicantRecords}
          className="w-full rounded-lg bg-[#102A43] px-4 py-3 font-semibold text-white transition hover:bg-[#243B53] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          Go to Applicant Records
        </button>

        <p className="text-xs leading-5 text-slate-500">
          Decisions are recorded when you select a status and click
          Save Decision beside the corresponding applicant.
        </p>
      </div>
    </section>
  );
}