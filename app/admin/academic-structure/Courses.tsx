import Link from "next/link";

export default function Courses() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-extrabold text-[#102A43]">
        Courses
      </h2>

      <p className="mt-3 text-slate-600">
        Manage courses and link them to the correct programme, school and
        department.
      </p>

      <Link
        href="/admin/courses"
        className="mt-6 inline-block rounded-lg bg-[#102A43] px-5 py-3 text-sm font-bold text-white hover:bg-[#243f5a]"
      >
        Open Course Management
      </Link>
    </section>
  );
}