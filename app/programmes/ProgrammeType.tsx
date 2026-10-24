type ProgrammeTypeProps = {
  title: string;
  description: string;
};

export default function ProgrammeType({
  title,
  description,
}: ProgrammeTypeProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#C9A227]">
        COELS Structure
      </p>

      <h2 className="mt-2 text-2xl font-extrabold text-[#102A43]">
        {title}
      </h2>

      <p className="mt-4 leading-7 text-slate-600">
        {description}
      </p>
    </div>
  );
}