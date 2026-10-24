"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = "http://127.0.0.1:8000/api";

type Course = {
  id?: number;
  course_code?: string | null;
  code?: string | null;
  title?: string | null;
  course_title?: string | null;
  name?: string | null;
  credit_unit?: number | string | null;
  credit_units?: number | string | null;
  units?: number | string | null;
};

type Department = {
  name?: string | null;
  department_name?: string | null;
  school?: {
    name?: string | null;
  } | null;
};

type Registration = {
  id: number;
  registration_year?: string | null;
  semester?: string | null;
  status?: string | null;
  course?: (Course & {
    department?: Department | null;
  }) | null;
};

type Result = {
  id: number;
  ca_score: number | string | null;
  exam_score: number | string | null;
  total_score: number | string | null;
  grade: string | null;
  is_published: boolean;
  published_at?: string | null;
  registration?: Registration | null;
};

type Student = {
  name?: string | null;
  registration_number?: string | null;
  academic_session?: string | null;
};

type GpaTerm = {
  academic_session: string;
  semester: string;
  status: "complete" | "incomplete";
  gpa: number | null;
  gpa_scale: number | null;
  credit_units: number | null;
  published_courses: number;
  missing_snapshot_count: number;
};

type ResultsResponse = {
  message?: string;
  student?: Student;
  data?: Result[] | { data?: Result[] };
  gpa_by_term?: GpaTerm[];
};

type MeResponse = {
  must_change_password?: boolean;
  message?: string;
};

export default function StudentResultsPage() {
  const router = useRouter();

  const [student, setStudent] = useState<Student | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [gpaByTerm, setGpaByTerm] = useState<GpaTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadResults = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/portal");
      return;
    }

    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      setError("");

      const meResponse = await fetch(`${API_URL}/me`, {
        headers,
        cache: "no-store",
      });

      if (!meResponse.ok) {
        localStorage.removeItem("token");
        router.replace("/portal");
        return;
      }

      const me = (await meResponse.json()) as MeResponse;

      if (me.must_change_password) {
        router.replace("/student/password");
        return;
      }

      const response = await fetch(`${API_URL}/student/results`, {
        headers,
        cache: "no-store",
      });

      const data = (await response.json()) as ResultsResponse;

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to retrieve your results."
        );
      }

      setStudent(data.student || null);

      setGpaByTerm(
        Array.isArray(data.gpa_by_term) ? data.gpa_by_term : []
      );

      const rows = Array.isArray(data.data)
        ? data.data
        : data.data?.data;

      setResults(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadResults();
  }, [loadResults]);

  function formatScore(
    value: number | string | null | undefined
  ): string {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    const number = Number(value);

    return Number.isFinite(number)
      ? number.toLocaleString("en-NG", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })
      : "—";
  }

  function formatSemester(value?: string | null): string {
    if (!value) return "—";

    const normalized = value.toLowerCase();

    if (normalized.includes("first")) return "First Semester";
    if (normalized.includes("second")) return "Second Semester";

    return value;
  }

  function getCourse(
    result: Result
  ): Course & { department?: Department | null } {
    return result.registration?.course || {};
  }

  function getCourseCode(result: Result): string {
    const course = getCourse(result);
    return course.course_code || course.code || "—";
  }

  function getCourseTitle(result: Result): string {
    const course = getCourse(result);

    return (
      course.title ||
      course.course_title ||
      course.name ||
      "Course title unavailable"
    );
  }

  function getDepartmentName(result: Result): string {
    const department = getCourse(result).department;

    return (
      department?.name ||
      department?.department_name ||
      "—"
    );
  }

  function getCreditUnits(result: Result): number {
    const course = getCourse(result);
    const value =
      course.credit_unit ?? course.credit_units ?? course.units ?? 0;
    const units = Number(value);

    return Number.isFinite(units) && units >= 0 ? units : 0;
  }

  const totalUnits = results.reduce(
    (sum, result) => sum + getCreditUnits(result),
    0
  );

  const academicSession =
    student?.academic_session ||
    results.find((result) => result.registration?.registration_year)
      ?.registration?.registration_year ||
    "Not specified";

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-5 sm:px-6 sm:py-8 print:min-h-0 print:bg-white print:p-0">
      <style jsx global>{`
        @page {
          size: A4 landscape;
          margin: 8mm;
        }

        @media print {
          html,
          body {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            color: #111827 !important;
            font-size: 9pt !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .no-print {
            display: none !important;
          }

          .results-page {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .results-sheet {
            width: 100% !important;
            margin: 0 !important;
            padding: 5mm !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
          }

          .results-table-wrapper {
            width: 100% !important;
            overflow: visible !important;
          }

          .results-table {
            width: 100% !important;
            min-width: 0 !important;
            table-layout: fixed !important;
            border-collapse: collapse !important;
            font-size: 8pt !important;
          }

          .results-table th,
          .results-table td {
            border: 1px solid #94a3b8 !important;
            padding: 5px 4px !important;
            color: #111827 !important;
            white-space: normal !important;
            overflow-wrap: anywhere !important;
            vertical-align: middle !important;
          }

          .results-table thead {
            display: table-header-group;
          }

          .results-table tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .student-summary {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          }

          .gpa-summary,
          .result-footer {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          a {
            color: inherit !important;
            text-decoration: none !important;
          }
        }
      `}</style>

      <div className="results-page mx-auto max-w-7xl">
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/student"
            className="font-semibold text-[#102A43] hover:underline"
          >
            ← Back to Student Dashboard
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            disabled={loading || results.length === 0 || !!error}
            className="rounded-lg bg-[#102A43] px-5 py-3 font-bold text-white hover:bg-[#183e5c] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Print / Save as PDF
          </button>
        </div>

        <header className="no-print mb-6">
          <h1 className="text-3xl font-extrabold text-[#102A43]">
            My Results
          </h1>
          <p className="mt-2 text-slate-600">
            View results published by COELS. Unpublished marks will not
            appear here.
          </p>
        </header>

        {loading && (
          <div className="rounded-xl bg-white p-6 text-slate-600">
            Loading your results...
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700"
          >
            <h2 className="font-bold">Unable to load results</h2>
            <p className="mt-2 text-sm">{error}</p>

            <button
              type="button"
              onClick={() => {
                setLoading(true);
                void loadResults();
              }}
              className="mt-4 rounded-lg bg-red-700 px-4 py-2 font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="results-sheet rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
              <header className="border-b-2 border-[#102A43] pb-5 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#102A43] text-xl font-black text-[#102A43]">
                  C
                </div>

                <h2 className="text-lg font-extrabold uppercase leading-tight text-[#102A43] sm:text-2xl">
                  College of Education and Legal Studies
                </h2>

                <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
                  KNOWLEDGE IS TREASURE
                </p>

                <h3 className="mt-4 text-lg font-extrabold uppercase tracking-wide">
                  Student Result Statement
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  Academic Session: <strong>{academicSession}</strong>
                </p>
              </header>

              <section className="student-summary mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Student Name
                  </p>
                  <p className="mt-1 break-words font-bold text-slate-900">
                    {student?.name || "Not available"}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Registration Number
                  </p>
                  <p className="mt-1 break-words font-bold text-slate-900">
                    {student?.registration_number || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Published Courses
                  </p>
                  <p className="mt-1 font-bold text-slate-900">
                    {results.length}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Total Registered Credit Units
                  </p>
                  <p className="mt-1 font-bold text-slate-900">
                    {formatScore(totalUnits)}
                  </p>
                </div>
              </section>

              <section className="gpa-summary mt-5 rounded-lg border border-slate-200 p-4">
                <h4 className="font-bold text-slate-900">
                  GPA Summary
                </h4>

                {gpaByTerm.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-600">
                    GPA is unavailable until published results have verified
                    grading snapshots.
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {gpaByTerm.map((term) => (
                      <div
                        key={`${term.academic_session}-${term.semester}`}
                        className="rounded-md border border-slate-100 p-3"
                      >
                        <p className="font-semibold text-slate-800">
                          {term.academic_session} — {formatSemester(term.semester)}
                        </p>

                        {term.status === "complete" &&
                        term.gpa !== null &&
                        term.gpa_scale !== null &&
                        term.credit_units !== null ? (
                          <p className="mt-1 text-sm text-slate-700">
                            GPA: <strong>{term.gpa.toFixed(2)}</strong>
                            {` / ${term.gpa_scale.toFixed(2)}`}
                            {` · ${term.credit_units} credit units`}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-amber-800">
                            GPA pending verification.{" "}
                            {term.missing_snapshot_count} published result(s)
                            lack complete grading snapshots or valid credit
                            units. No GPA is displayed until the term can be
                            calculated reliably.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {results.length === 0 ? (
                <div className="no-print mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900">
                  <h3 className="font-bold">No published results yet</h3>
                  <p className="mt-2 text-sm leading-6">
                    Your results will appear here after authorized COELS
                    staff enter your marks and publish them.
                  </p>
                </div>
              ) : (
                <>

                  <div className="results-table-wrapper mx-auto mt-7 w-full max-w-5xl overflow-x-auto">
                    <table className="results-table mx-auto w-full min-w-[650px] table-fixed border-collapse text-left text-xs sm:text-sm">
                      <colgroup>
                        <col style={{ width: "7%" }} />
                        <col style={{ width: "17%" }} />
                        <col style={{ width: "34%" }} />
                        <col style={{ width: "20%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "12%" }} />
                      </colgroup>


                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-300 px-2 py-3">
                            S/N
                          </th>
                          <th className="border border-slate-300 px-2 py-3">
                            Course Code
                          </th>
                          <th className="border border-slate-300 px-2 py-3">
                            Course Title / Department
                          </th>
                          <th className="border border-slate-300 px-2 py-3">
                            Semester
                          </th>
                          <th className="border border-slate-300 px-2 py-3 text-center">
                            Units
                          </th>

                          <th className="border border-slate-300 px-2 py-3 text-center">
                            Grade
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {results.map((result, index) => (
                          <tr
                            key={result.id}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-slate-50"
                            }
                          >
                            <td className="border border-slate-300 px-2 py-3">
                              {index + 1}
                            </td>

                            <td className="break-words border border-slate-300 px-2 py-3 font-bold">
                              {getCourseCode(result)}
                            </td>

                            <td className="break-words border border-slate-300 px-2 py-3">
                              <p className="font-semibold">
                                {getCourseTitle(result)}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {getDepartmentName(result)}
                              </p>
                            </td>

                            <td className="break-words border border-slate-300 px-2 py-3">
                              {formatSemester(result.registration?.semester)}
                            </td>

                            <td className="border border-slate-300 px-2 py-3 text-center">
                              {formatScore(getCreditUnits(result))}
                            </td>



                            <td className="border border-slate-300 px-2 py-3 text-center text-xs font-semibold">
                              {result.grade || "Grade unavailable"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="text-xs">
                      Historical results without saved grading snapshots are
                      excluded from GPA calculations until verified. Grades
                      shown above follow the result data returned by COELS.
                    </p>
                  </div>

                  <footer className="result-footer mt-10 grid grid-cols-2 gap-8 sm:gap-16">
                    <div className="pt-8">
                      <div className="border-t border-slate-500 pt-2">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-700">
                          Head of Department
                        </p>
                      </div>
                    </div>

                    <div className="pt-8">
                      <div className="border-t border-slate-500 pt-2">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-700">
                          Authorized Signature / Stamp
                        </p>
                      </div>
                    </div>
                  </footer>

                  <p className="mt-7 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
                    This statement displays results published in the COELS
                    student portal. The official grading scale is subject
                    to the college&apos;s approved academic policy.
                  </p>
                </>
              )}
            </section>

            <div className="no-print mt-5 flex flex-wrap gap-3">
              <Link
                href="/student"
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-[#102A43] hover:bg-slate-50"
              >
                Student Dashboard
              </Link>

              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  void loadResults();
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Refresh Results
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
