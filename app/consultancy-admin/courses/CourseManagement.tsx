"use client";

import { useState } from "react";

type Course = {
  id: number;
  title: string;
  programme: string;
  intake: string;
  status: "Active" | "Inactive";
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

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);

  const [title, setTitle] = useState("");
  const [programme, setProgramme] = useState(programmes[0]);
  const [intake, setIntake] = useState("2025/2026 First Intake");

  function addCourse() {
    if (!title.trim()) return;

    setCourses([
      ...courses,
      {
        id: Date.now(),
        title: title.trim(),
        programme,
        intake,
        status: "Active",
      },
    ]);

    setTitle("");
  }

  function toggleStatus(id: number) {
    setCourses(
      courses.map((course) =>
        course.id === id
          ? {
              ...course,
              status:
                course.status === "Active" ? "Inactive" : "Active",
            }
          : course
      )
    );
  }

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Add Consultancy Course
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Consultancy courses do not require course codes.
        </p>

        <div className="mt-6 grid gap-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Course Title
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter course title"
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

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Intake
            </label>

            <input
              value={intake}
              onChange={(e) => setIntake(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            />
          </div>

          <button
            type="button"
            onClick={addCourse}
            className="w-fit rounded-lg bg-[#102A43] px-7 py-3 font-semibold text-white hover:bg-[#243B53]"
          >
            Add Course
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Consultancy Course Records
        </h2>

        {courses.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">
            No consultancy courses have been added yet.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="rounded-xl border border-slate-200 p-5"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h3 className="font-bold text-[#102A43]">
                      {course.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-600">
                      Programme: {course.programme}
                    </p>

                    <p className="text-sm text-slate-600">
                      Intake: {course.intake}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[#C9A227]">
                      Course Code: Not Applicable
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleStatus(course.id)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold ${
                      course.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {course.status}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-bold text-[#102A43]">
          Consultancy Course Rules
        </h2>

        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
          <li>• Consultancy courses have no course code.</li>
          <li>• Every course belongs to a consultancy programme.</li>
          <li>• Every course belongs to an intake.</li>
          <li>• Courses can be activated or deactivated.</li>
          <li>• Consultancy courses are separate from NCE and ND courses.</li>
        </ul>
      </div>
    </section>
  );
}