export default function AdmissionInfo() {
  return (
    <div>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold text-[#102A43]">
            Admission Requirements
          </h2>

          <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
            <li>
              • Relevant credits in WAEC, NECO, GCE or N-VAIS as applicable.
            </li>
            <li>• JAMB is compulsory for the relevant admission process.</li>
            <li>• Minimum UTME score: 100.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold text-[#102A43]">
            Application Process
          </h2>

          <ol className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
            <li>1. Create an applicant account.</li>
            <li>2. Select your programme.</li>
            <li>3. Complete your personal and academic information.</li>
            <li>4. Upload the required documents.</li>
            <li>5. Pay the application fee.</li>
            <li>6. Submit your application.</li>
            <li>7. Print your application slip.</li>
            <li>8. Check your admission status.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}