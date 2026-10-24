"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#102A43] text-lg font-bold text-white">
            C
          </div>

          <div>
            <div className="text-lg font-extrabold tracking-tight text-[#102A43]">
              COELS
            </div>
            <div className="hidden text-xs font-medium text-slate-500 sm:block">
              College of Education and Legal Studies
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          <Link href="/" className="text-sm font-semibold text-slate-700 hover:text-[#102A43]">
            Home
          </Link>
          <Link href="/about" className="text-sm font-semibold text-slate-700 hover:text-[#102A43]">
            About
          </Link>
          <Link href="/schools" className="text-sm font-semibold text-slate-700 hover:text-[#102A43]">
            Schools
          </Link>
          <Link href="/programmes" className="text-sm font-semibold text-slate-700 hover:text-[#102A43]">
            Programmes
          </Link>
          <Link href="/admissions" className="text-sm font-semibold text-slate-700 hover:text-[#102A43]">
            Admissions
          </Link>
          <Link href="/news" className="text-sm font-semibold text-slate-700 hover:text-[#102A43]">
            News
          </Link>
          <Link href="/contact" className="text-sm font-semibold text-slate-700 hover:text-[#102A43]">
            Contact
          </Link>

          <Link
            href="/portal"
            className="rounded-lg bg-[#102A43] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#243B53]"
          >
            Portal Login
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xl text-[#102A43] lg:hidden"
          aria-label="Open menu"
        >
          ☰
        </button>
      </div>

      {open && (
        <nav className="border-t border-slate-200 bg-white px-5 py-4 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4">
            {[
              ["Home", "/"],
              ["About", "/about"],
              ["Schools", "/schools"],
              ["Programmes", "/programmes"],
              ["Admissions", "/admissions"],
              ["News", "/news"],
              ["Contact", "/contact"],
              ["Portal Login", "/portal"],
            ].map(([name, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="font-semibold text-slate-700"
              >
                {name}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}