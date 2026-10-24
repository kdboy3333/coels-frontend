import Link from "next/link";

export default function Departments() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-extrabold text-[#102A43]">
        Departments
      </h2>

      <p className="mt-3 text-slate-600">
        Manage departments and associate them with the appropriate schools.
      </p>

      <Link
        href="/admin/schools-departments"
        className="mt-6 inline-block rounded-lg bg-[#102A43] px-5 py-3 text-sm font-bold text-white hover:bg-[#243f5a]"
      >
        Open Department Management
      </Link>
    </section>
  );
}