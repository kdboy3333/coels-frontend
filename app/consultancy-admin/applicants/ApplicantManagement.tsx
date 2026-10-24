"use client";

import { useState } from "react";

type Applicant = {
  id: number;
  name: string;
  email: string;
  phone: string;
  programme: string;
  intake: string;
  status: "Pending" | "Approved" | "Rejected";
};

const programmes = [
  "Advanced Diploma in Legal Studies",
  "Advanced Diploma in Public Administration",
  "Advanced Diploma in Local Government Administration",
  "Advanced Diploma in Qur’anic Science",
  "Professional Diploma in Education (PDE-TRCN)",
  "Professional Diploma in Criminology and Security Studies",
  "Professional Diploma in Cyber Security",
  "Professional Diploma in Local Government Administration",
  "Professional Diploma in English Language Proficiency",
  "Professional Diploma in Arabic Language Proficiency",
  "Professional Intermediate Certificate in Arabic Language Proficiency",
  "Professional Intermediate Certificate in English Language Proficiency",
  "Professional Basic Certificate in Arabic Language Proficiency",
  "Professional Basic Certificate in French Language Proficiency",
  "Professional Certificate in Ulumu Qur’an",
  "Professional Certificate in Qira’at",
  "Professional Certificate in Tafsir",
  "Certificate in Data Science",
  "Certificate in Cyber Security",
  "Certificate in Computer Applications",
  "Certificate in Computer Applications Arabic Medium",
];

export default function ApplicantManagement() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [programme, setProgramme] = useState(programmes[0]);
  const [intake, setIntake] = useState("2025/2026 First Intake");

  function addApplicant() {
    if (!name.trim() || !email.trim() || !phone.trim()) return;

    setApplicants([
      ...applicants,
      {
        id: Date.now(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        programme,
        intake,
        status: "Pending",
      },
    ]);

    setName("");
    setEmail("");
    setPhone("");
  }

  function changeStatus(
    id: number,
    status: "Pending" | "Approved" | "Rejected"
  ) {
    setApplicants(
      applicants.map((applicant) =>
        applicant.id === id ? { ...applicant, status } : applicant
      )
    );
  }

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Add Consultancy Applicant
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Full Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Phone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08000000000"
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Programme
            </label>
            <select
              value={programme}
              onChange={(e) => setProgramme(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            >
              {programmes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Intake
            </label>
            <input
              value={intake}
              onChange={(e) => setIntake(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={addApplicant}
          className="mt-6 rounded-lg bg-[#102A43] px-7 py-3 font-semibold text-white hover:bg-[#243B53]"
        >
          Add Applicant
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Applicant Records
        </h2>

        {applicants.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">
            No consultancy applicants have been added yet.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {applicants.map((applicant) => (
              <div
                key={applicant.id}
                className="rounded-xl border border-slate-200 p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="font-bold text-[#102A43]">
                      {applicant.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      Email: {applicant.email}
                    </p>

                    <p className="text-sm text-slate-600">
                      Phone: {applicant.phone}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      Programme: {applicant.programme}
                    </p>

                    <p className="text-sm text-slate-600">
                      Intake: {applicant.intake}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => changeStatus(applicant.id, "Pending")}
                      className="rounded-lg bg-yellow-100 px-4 py-2 text-xs font-semibold text-yellow-700"
                    >
                      Pending
                    </button>

                    <button
                      type="button"
                      onClick={() => changeStatus(applicant.id, "Approved")}
                      className="rounded-lg bg-green-100 px-4 py-2 text-xs font-semibold text-green-700"
                    >
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() => changeStatus(applicant.id, "Rejected")}
                      className="rounded-lg bg-red-100 px-4 py-2 text-xs font-semibold text-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-200 pt-4">
                  <span className="text-sm font-semibold text-slate-600">
                    Application Status:
                  </span>{" "}
                  <span className="font-bold text-[#102A43]">
                    {applicant.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-bold text-[#102A43]">
          Applicant Rules
        </h2>

        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
          <li>• Every applicant belongs to a consultancy programme.</li>
          <li>• Every applicant belongs to an intake.</li>
          <li>• New applications start as Pending.</li>
          <li>• Consultancy Admin can approve or reject applications.</li>
          <li>• Approved applicants can proceed to consultancy admission.</li>
          <li>• Applicant records remain separate from main COELS admissions.</li>
        </ul>
      </div>
    </section>
  );
}