export default function StudentNotice() {
  return (
    <div className="rounded-2xl border border-[#C9A227]/30 bg-[#C9A227]/10 p-6">
      <h3 className="font-bold text-[#102A43]">
        Automatic Registration Number Rule
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-700">
        A student receives a permanent registration number only after the
        first school-fee payment has been successfully confirmed. The system
        checks the student&apos;s school, department and registration year,
        then assigns the next available sequential number.
      </p>

      <p className="mt-3 text-sm leading-6 text-slate-700">
        The sequence is maintained separately for each school, department and
        registration year. Staff should not manually assign registration
        numbers.
      </p>
    </div>
  );
}