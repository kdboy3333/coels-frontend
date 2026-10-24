export default function AdmissionNotice() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[#102A43] p-8 text-white">
      <h2 className="text-2xl font-extrabold">
        Important Admission Information
      </h2>

      <p className="mt-4 max-w-3xl leading-7 text-slate-300">
        Applicants should follow the required admission procedure and provide
        accurate information and valid supporting documents.
      </p>

      <p className="mt-4 max-w-3xl leading-7 text-slate-300">
        Applicants requiring a change of institution should use the JAMB
        portal as required and complete the COELS admission procedure through
        the appropriate portal.
      </p>
    </div>
  );
}