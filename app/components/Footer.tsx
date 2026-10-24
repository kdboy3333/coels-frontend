import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#102A43] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <h2 className="text-xl font-bold">COELS</h2>
          <p className="mt-3 text-sm text-slate-300">
            College of Education and Legal Studies
          </p>
          <p className="mt-2 text-sm text-slate-200">
            KNOWLEDGE IS TREASURE.
          </p>
        </div>

        <div>
          <h3 className="font-bold">Quick Links</h3>
          <div className="mt-4 flex flex-col gap-2 text-sm text-slate-300">
            <Link href="/about">About COELS</Link>
            <Link href="/programmes">Programmes</Link>
            <Link href="/admissions">Admissions</Link>
            <Link href="/news">News & Notices</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>

        <div>
          <h3 className="font-bold">Contact</h3>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            College of Education and Legal Studies
            <br />
            Nguru, Yobe State
            <br />
            PMB 021
          </p>
        </div>
      </div>

      <div className="border-t border-slate-600 px-5 py-5 text-center text-sm text-slate-400">
        © 2026 College of Education and Legal Studies. All rights reserved.
      </div>
    </footer>
  );
}