import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-[#102A43]">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 lg:grid-cols-2">
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#C9A227]">
            Welcome to COELS
          </p>

          <h1 className="text-4xl font-extrabold leading-tight text-white md:text-6xl">
            College of Education and Legal Studies
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Building knowledge, developing skills and preparing students for
            academic and professional success.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/admissions"
              className="rounded-lg bg-white px-6 py-3 font-bold text-[#102A43] hover:bg-slate-100"
            >
              Apply for Admission
            </Link>

            <Link
              href="/portal"
              className="rounded-lg border border-slate-400 px-6 py-3 font-bold text-white hover:bg-white/10"
            >
              Portal Login
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <div className="rounded-xl bg-white p-8 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-[#102A43] text-4xl font-extrabold text-white">
              C
            </div>

            <h2 className="mt-6 text-2xl font-bold text-[#102A43]">
              COELS
            </h2>

            <p className="mt-2 text-sm italic text-slate-500">
              KNOWLEDGE IS TREASURE.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}