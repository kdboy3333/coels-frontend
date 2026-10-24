export default function RegistrationNumber() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#102A43]">
        Registration Number Automation
      </h2>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        Registration numbers are not entered or generated manually by
        staff.
      </p>

      <div className="mt-6 rounded-xl bg-slate-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Automatic Process
        </p>

        <div className="mt-4 space-y-3 text-sm text-slate-700">
          <p>
            1. Student account is created after admission approval.
          </p>

          <p>
            2. Student receives temporary login credentials.
          </p>

          <p>
            3. Student pays the required first school fee.
          </p>

          <p>
            4. Super Admin confirms the successful payment.
          </p>

          <p>
            5. The system checks School + Department + Registration Year.
          </p>

          <p>
            6. The next available sequential registration number is
            generated automatically.
          </p>

          <p>
            7. The generated registration number becomes the student's
            permanent username.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-[#C9A227] bg-yellow-50 p-4">
        <p className="text-sm font-semibold text-[#102A43]">
          Example
        </p>

        <p className="mt-2 text-sm text-slate-700">
          2026-SOS-SE-002
        </p>

        <p className="mt-1 text-xs text-slate-500">
          The actual number is generated from the student's real
          academic structure and existing sequence.
        </p>
      </div>
    </div>
  );
}