"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = "http://127.0.0.1:8000/api";

type AcademicUnit = {
  name?: string | null;
  short_name?: string | null;
};

type StudentProfile = {
  registration_number?: string | null;
  admission_number?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  academic_session?: string | null;
  current_level?: string | number | null;
  current_semester?: string | null;
  registration_year?: string | number | null;
  programme?: AcademicUnit | null;
  school?: AcademicUnit | null;
  department?: AcademicUnit | null;
};

type RegisteredCourse = {
  id: number;
  course_code?: string | null;
  title?: string | null;
  name?: string | null;
  credit_units?: number | string | null;
  credit_unit?: number | string | null;
  units?: number | string | null;
};

type Registration = {
  id: number;
  registration_year?: string | null;
  semester?: string | null;
  status?: string | null;
  course?: RegisteredCourse | null;
};

type MeResponse = {
  user: {
    name: string;
    email: string;
    username: string | null;
    must_change_password?: boolean;
    student_profile?: StudentProfile | null;
  };
  must_change_password: boolean;
};

type RegistrationsResponse = {
  student: StudentProfile;
  registrations: Registration[];
  message?: string;
};

export default function RegistrationSlipPage() {
  const router = useRouter();

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSlip = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/portal");
      return;
    }

    try {
      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [meResponse, registrationsResponse] = await Promise.all([
        fetch(`${API_URL}/me`, { headers }),
        fetch(`${API_URL}/student/course-registrations`, { headers }),
      ]);

      const meData = (await meResponse.json()) as MeResponse;
      const registrationData =
        (await registrationsResponse.json()) as RegistrationsResponse;

      if (!meResponse.ok) {
        throw new Error("Unable to load your student account. Please sign in again.");
      }

      if (meData.must_change_password) {
        router.replace("/student/password");
        return;
      }

      if (!registrationsResponse.ok) {
        throw new Error(
          registrationData.message ||
            "Unable to load your course registrations."
        );
      }

      setStudent(
        registrationData.student ||
          meData.user.student_profile ||
          null
      );
      setStudentName(meData.user.name || "");
      setEmail(meData.user.email || "");
      setRegistrations(
        Array.isArray(registrationData.registrations)
          ? registrationData.registrations
          : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while loading the registration slip."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadSlip();
  }, [loadSlip]);

  const fullName =
    [
      student?.first_name,
      student?.middle_name,
      student?.last_name,
    ]
      .filter(Boolean)
      .join(" ") ||
    studentName ||
    "Not available";

  const selectedSession =
    student?.academic_session ||
    registrations.find((item) => item.registration_year)
      ?.registration_year ||
    "Not available";

  const selectedSemester =
    student?.current_semester ||
    registrations.find((item) => item.semester)?.semester ||
    "Not available";

  const totalCredits = registrations.reduce((total, item) => {
    const course = item.course;
    const units =
      course?.credit_units ??
      course?.credit_unit ??
      course?.units;

    const parsed = Number(units);
    return total + (Number.isFinite(parsed) ? parsed : 0);
  }, 0);

  function value(input: string | number | null | undefined) {
    return input === null || input === undefined || input === ""
      ? "Not available"
      : String(input);
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/student"
            className="text-sm font-semibold text-[#102A43] hover:underline"
          >
            ← Back to Student Dashboard
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            disabled={loading || !!error}
            className="rounded-lg bg-[#102A43] px-5 py-3 text-sm font-bold text-white hover:bg-[#183e5c] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Print Registration Slip
          </button>
        </div>

        {loading && (
          <div className="rounded-xl bg-white p-8 text-slate-600 shadow-sm">
            Loading your registered courses...
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700"
          >
            <h2 className="font-bold">Unable to load registration slip</h2>
            <p className="mt-2 text-sm">{error}</p>
            <button
              type="button"
              onClick={() => {
                setError("");
                setLoading(true);
                void loadSlip();
              }}
              className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white print:hidden"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-10 print:border-0 print:p-0 print:shadow-none">
            <header className="border-b-2 border-[#102A43] pb-6 text-center">
              <h1 className="text-2xl font-extrabold uppercase tracking-wide text-[#102A43] sm:text-3xl">
                College of Education and Legal Studies
              </h1>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                COELS Student Portal
              </p>
              <div className="mt-5 inline-block rounded-lg border border-[#C9A227] px-5 py-2">
                <h2 className="text-lg font-extrabold uppercase text-[#102A43]">
                  Course Registration Slip
                </h2>
              </div>
            </header>

            <section className="mt-7">
              <h3 className="border-b border-slate-200 pb-2 text-sm font-extrabold uppercase tracking-wide text-[#102A43]">
                Student Information
              </h3>

              <div className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {[
                  ["Student Name", fullName],
                  [
                    "Registration Number",
                    value(student?.registration_number),
                  ],
                  ["Admission Number", value(student?.admission_number)],
                  ["Email Address", value(email)],
                  [
                    "Programme",
                    value(
                      student?.programme?.name ||
                        student?.programme?.short_name
                    ),
                  ],
                  [
                    "School",
                    value(
                      student?.school?.name ||
                        student?.school?.short_name
                    ),
                  ],
                  [
                    "Department",
                    value(
                      student?.department?.name ||
                        student?.department?.short_name
                    ),
                  ],
                  ["Current Level", value(student?.current_level)],
                  ["Academic Session", value(selectedSession)],
                  ["Semester", value(selectedSemester)],
                ].map(([label, detail]) => (
                  <div key={label}>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      {label}
                    </p>
                    <p className="mt-1 break-words text-sm font-bold text-slate-800">
                      {detail}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-8">
              <h3 className="border-b border-slate-200 pb-2 text-sm font-extrabold uppercase tracking-wide text-[#102A43]">
                Registered Courses
              </h3>

              {registrations.length === 0 ? (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                  No course registrations were found for this student.
                  Register your courses first; the slip will update
                  automatically when registrations are available.
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-300 px-3 py-3">#</th>
                        <th className="border border-slate-300 px-3 py-3">
                          Course Code
                        </th>
                        <th className="border border-slate-300 px-3 py-3">
                          Course Title
                        </th>
                        <th className="border border-slate-300 px-3 py-3">
                          Semester
                        </th>
                        <th className="border border-slate-300 px-3 py-3">
                          Units
                        </th>
                        <th className="border border-slate-300 px-3 py-3">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((registration, index) => {
                        const course = registration.course;
                        const units =
                          course?.credit_units ??
                          course?.credit_unit ??
                          course?.units;

                        return (
                          <tr key={registration.id}>
                            <td className="border border-slate-300 px-3 py-3">
                              {index + 1}
                            </td>
                            <td className="border border-slate-300 px-3 py-3 font-semibold">
                              {value(course?.course_code)}
                            </td>
                            <td className="border border-slate-300 px-3 py-3">
                              {value(course?.title || course?.name)}
                            </td>
                            <td className="border border-slate-300 px-3 py-3">
                              {value(registration.semester)}
                            </td>
                            <td className="border border-slate-300 px-3 py-3">
                              {value(units)}
                            </td>
                            <td className="border border-slate-300 px-3 py-3 capitalize">
                              {value(registration.status)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {totalCredits > 0 && (
                      <tfoot>
                        <tr className="bg-slate-50 font-bold">
                          <td
                            colSpan={4}
                            className="border border-slate-300 px-3 py-3 text-right"
                          >
                            Total Credit Units
                          </td>
                          <td className="border border-slate-300 px-3 py-3">
                            {totalCredits}
                          </td>
                          <td className="border border-slate-300 px-3 py-3" />
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}
            </section>

            <footer className="mt-12 grid gap-10 sm:grid-cols-2">
              <div>
                <div className="border-t border-slate-500 pt-2">
                  <p className="text-sm font-semibold text-slate-700">
                    Student Signature
                  </p>
                </div>
              </div>
              <div>
                <div className="border-t border-slate-500 pt-2">
                  <p className="text-sm font-semibold text-slate-700">
                    Departmental Approval
                  </p>
                </div>
              </div>
            </footer>

            <p className="mt-8 text-center text-xs text-slate-500">
              This slip displays course registrations currently recorded
              in the COELS student system.
            </p>
          </article>
        )}
      </div>
    </main>
  );
}