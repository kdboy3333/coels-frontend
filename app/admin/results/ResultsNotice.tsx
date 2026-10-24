export default function ResultsNotice() {
  return (
    <div className="rounded-2xl border border-[#C9A227]/30 bg-[#C9A227]/10 p-6">
      <h2 className="text-lg font-bold text-[#102A43]">
        COELS Result Rules
      </h2>

      <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
        <li>• Continuous Assessment (CA) = 30 marks.</li>

        <li>• Examination = 70 marks.</li>

        <li>• Total Result = CA + Examination = 100 marks.</li>

        <li>• Results can be entered for the whole class in bulk.</li>

        <li>
          • Excel upload and copy/paste workflows will be connected to the
          backend later.
        </li>

        <li>• Grade and grade point are calculated automatically.</li>

        <li>• 70–100 = A / 5 points.</li>

        <li>• 60–69 = B / 4 points.</li>

        <li>• 50–59 = C / 3 points.</li>

        <li>• 45–49 = D / 2 points.</li>

        <li>• 40–44 = E / 1 point.</li>

        <li>• 0–39 = F / 0 points.</li>
      </ul>
    </div>
  );
}