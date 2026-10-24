type NewsCardProps = {
  title: string;
  date: string;
  description: string;
};

export default function NewsCard({
  title,
  date,
  description,
}: NewsCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <p className="text-sm font-semibold text-[#C9A227]">{date}</p>

      <h2 className="mt-3 text-xl font-bold text-[#102A43]">
        {title}
      </h2>

      <p className="mt-3 leading-7 text-slate-600">
        {description}
      </p>

      <button
        type="button"
        className="mt-5 font-bold text-[#102A43] hover:text-[#C9A227]"
      >
        Read More →
      </button>
    </article>
  );
}