"use client";

import { FormEvent, useState } from "react";

export default function HODManagement() {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage(
      "Staff account setup saved. A secure temporary password will be generated and emailed when the backend is connected."
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#102A43]">
          HOD & Staff Account Management
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Add authorised lecturers, HODs and departmental staff.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Staff Full Name
          </label>

          <input
            type="text"
            placeholder="Enter full name"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#C9A227]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Email Address
          </label>

          <input
            type="email"
            placeholder="staff@example.com"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#C9A227]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Username
          </label>

          <input
            type="text"
            placeholder="Choose username"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#C9A227]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Staff Role
          </label>

          <select className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#C9A227]">
            <option>Lecturer</option>
            <option>HOD</option>
            <option>Registry Staff</option>
            <option>Bursary Staff</option>
            <option>Academic Staff</option>
            <option>Departmental Staff</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            School
          </label>

          <select className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#C9A227]">
            <option>School of Science</option>
            <option>School of Law</option>
            <option>School of Art and Social Sciences</option>
            <option>School of Education</option>
            <option>School of Language</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Department
          </label>

          <input
            type="text"
            placeholder="Enter department"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#C9A227]"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Permissions
          </label>

          <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" />
              Course Management
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" />
              Result Entry
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" />
              Student Management
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" />
              Course Registration
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" />
              Reports
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" />
              Department Management
            </label>
          </div>
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="rounded-xl bg-[#102A43] px-6 py-3 font-semibold text-white hover:bg-[#243B53]"
          >
            Create Staff Account
          </button>
        </div>

        {message && (
          <div className="md:col-span-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}
      </form>
    </div>
  );
}