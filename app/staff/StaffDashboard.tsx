const staffInformation = [
  ["Staff Name", "Will be displayed after login"],
  ["Staff ID", "Will be displayed from staff record"],
  ["Role", "Will be determined by permissions"],
  ["School", "Will be displayed from staff assignment"],
  ["Department", "Will be displayed where applicable"],
];

export default function StaffDashboard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#C9A227]">
        Staff Account
      </p>

      <h2 className="mt-2 text-2xl font-extrabold text-[#102A43]">
        Welcome, Staff Member
      </h2>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {staffInformation.map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {label}
            </p>

            <p className="mt-2 text-sm font-bold text-[#102A43]">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}