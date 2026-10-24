type SchoolCardProps = {
  name: string;
  description: string;
};

export default function SchoolCard({
  name,
  description,
}: SchoolCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
      <h2 className="text-xl font-bold text-[#102A43]">{name}</h2>

      <p className="mt-3 leading-7 text-slate-600">{description}</p>

      <button className="mt-5 font-bold text-[#102A43] hover:text-[#C9A227]">
        View Departments →
      </button>
    </div>
  );
}