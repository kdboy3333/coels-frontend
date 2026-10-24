type ProgrammeCardProps = {
  code: string;
  title: string;
  description: string;
};

export default function ProgrammeCard({
  code,
  title,
  description,
}: ProgrammeCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#102A43] text-lg font-extrabold text-white">
        {code}
      </div>

      <h2 className="mt-6 text-2xl font-extrabold text-[#102A43]">
        {title}
      </h2>

      <p className="mt-4 leading-7 text-slate-600">
        {description}
      </p>

      <button
        type="button"
        className="mt-6 rounded-lg bg-[#102A43] px-5 py-3 text-sm font-bold text-white hover:bg-[#243B53]"
      >
        View Programmes
      </button>
    </div>
  );
}