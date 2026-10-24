type SchoolHeaderProps = {
  title: string;
  description: string;
};

export default function SchoolHeader({
  title,
  description,
}: SchoolHeaderProps) {
  return (
    <div className="border-b border-slate-200 pb-6">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#C9A227]">
        COELS Academic Structure
      </p>

      <h1 className="mt-2 text-3xl font-extrabold text-[#102A43]">
        {title}
      </h1>

      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
        {description}
      </p>
    </div>
  );
}