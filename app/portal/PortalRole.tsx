type PortalRoleProps = {
  title: string;
  description: string;
};

export default function PortalRole({
  title,
  description,
}: PortalRoleProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
      <h2 className="text-lg font-bold text-[#102A43]">{title}</h2>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}