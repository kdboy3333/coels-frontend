export default function FinanceNotice() {
  return (
    <div className="rounded-2xl border border-[#C9A227]/30 bg-[#C9A227]/10 p-6">
      <h3 className="font-bold text-[#102A43]">
        Payment & Registration Rule
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-700">
        The finance system records the total amount due, amount paid, payment
        status, payment date and payment reference. Partial payment is not
        allowed where the configured fee requires full payment.
      </p>

      <p className="mt-3 text-sm leading-6 text-slate-700">
        Once the student&apos;s first school-fee payment is successfully
        confirmed, the backend will trigger the automatic registration-number
        process.
      </p>
    </div>
  );
}