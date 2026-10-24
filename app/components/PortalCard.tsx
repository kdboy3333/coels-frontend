import Link from "next/link";

type PortalCardProps = {
  title: string;
  description: string;
  href: string;
};

export default function PortalCard({
  title,
  description,
  href,
}: PortalCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <h3 className="text-xl font-bold text-[#102A43]">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {description}
      </p>

      <Link
        href={href}
        className="mt-5 inline-block font-bold text-[#102A43] hover:text-[#C9A227]"
      >
        Access Portal →
      </Link>
    </div>
  );
}