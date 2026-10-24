"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api";

type Result = {
  id: number;
  ca_score: number | string | null;
  exam_score: number | string | null;
  is_published: boolean;
  published_at?: string | null;
};

type StudentProfile = {
  id: number;
  registration_number?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  department?: {
    name?: string | null;
  } | null;
};

type Course = {
  id: number;
  code?: string | null;
  course_code?: string | null;
  title?: string | null;
  name?: string | null;
  course_title?: string | null;
  credit_units?: number | string | null;
  units?: number | string | null;
  department?: {
    name?: string | null;
    school?: {
      name?: string | null;
    } | null;
  } | null;
};

type Registration = {
  id: number;
  student_profile_id: number;
  course_id: number;
  registration_year: string;
  semester: string;
  status: string;
  student_profile?: StudentProfile | null;
  course?: Course | null;
  result?: Result | null;
};

type ApiResponse<T> = {
  message?: string;
  data?: T;
  registrations?: T;
  errors?: Record<string, string[]>;
};

type MarkDraft = {
  ca: string;
  exam: string;
};

function getMessage(data: unknown, fallback: string): string {
  if (
    data !== null &&
    typeof data === "object" &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  if (
    data !== null &&
    typeof data === "object" &&
    "errors" in data &&
    data.errors &&
    typeof data.errors === "object"
  ) {
    const errors = data.errors as Record<string, string[]>;
    const first = Object.values(errors).flat()[0];

    if (first) return first;
  }

  return fallback;
}

function studentName(registration: Registration): string {
  const profile = registration.student_profile;

  const fullName = [
    profile?.first_name,
    profile?.middle_name,
    profile?.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || profile?.user?.name || "Student";
}

function courseCode(course?: Course | null): string {
  return course?.code || course?.course_code || "No code";
}

function courseTitle(course?: Course | null): string {
  return (
    course?.title ||
    course?.course_title ||
    course?.name ||
    "Untitled course"
  );
}

function numericScore(value: string | number | null | undefined): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function totalScore(draft?: MarkDraft): number | null {
  if (!draft || draft.ca.trim() === "" || draft.exam.trim() === "") {
    return null;
  }

  const ca = Number(draft.ca);
  const exam = Number(draft.exam);

  if (!Number.isFinite(ca) || !Number.isFinite(exam)) {
    return null;
  }

  return ca + exam;
}

function formatScore(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";

  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2) : String(value);
}

export default function ResultsManagementPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [drafts, setDrafts] = useState<Record<number, MarkDraft>>({});
  const [courseFilter, setCourseFilter] = useState("all");
  const [sessionFilter, setSessionFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRegistrations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/portal";
        return;
      }

      const response = await fetch(`${API_URL}/results/registrations`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data: ApiResponse<Registration[]> = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/portal";
        return;
      }

      if (!response.ok) {
        throw new Error(
          getMessage(data, "Unable to load course registrations.")
        );
      }

      const records = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.registrations)
          ? data.registrations
          : [];

      setRegistrations(records);

      const initialDrafts: Record<number, MarkDraft> = {};

      for (const registration of records) {
        const result = registration.result;

        initialDrafts[registration.id] = {
          ca:
            result?.ca_score === null || result?.ca_score === undefined
              ? ""
              : String(result.ca_score),
          exam:
            result?.exam_score === null || result?.exam_score === undefined
              ? ""
              : String(result.exam_score),
        };
      }

      setDrafts(initialDrafts);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while loading registrations."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRegistrations();
  }, [loadRegistrations]);

  const courses = useMemo(() => {
    const unique = new Map<number, Course>();

    for (const registration of registrations) {
      if (registration.course) {
        unique.set(registration.course_id, registration.course);
      }
    }

    return Array.from(unique.entries()).map(([id, course]) => ({
      id,
      course,
    }));
  }, [registrations]);

  const sessions = useMemo(
    () =>
      Array.from(
        new Set(registrations.map((item) => item.registration_year))
      ).sort((a, b) => b.localeCompare(a)),
    [registrations]
  );

  const semesters = useMemo(
    () =>
      Array.from(new Set(registrations.map((item) => item.semester))).sort(),
    [registrations]
  );

  const filteredRegistrations = useMemo(() => {
    const term = search.trim().toLowerCase();

    return registrations.filter((registration) => {
      if (
        courseFilter !== "all" &&
        String(registration.course_id) !== courseFilter
      ) {
        return false;
      }

      if (
        sessionFilter !== "all" &&
        registration.registration_year !== sessionFilter
      ) {
        return false;
      }

      if (
        semesterFilter !== "all" &&
        registration.semester !== semesterFilter
      ) {
        return false;
      }

      if (!term) return true;

      const profile = registration.student_profile;
      const searchable = [
        studentName(registration),
        profile?.registration_number,
        profile?.user?.email,
        courseCode(registration.course),
        courseTitle(registration.course),
        registration.registration_year,
        registration.semester,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(term);
    });
  }, [
    registrations,
    courseFilter,
    sessionFilter,
    semesterFilter,
    search,
  ]);

  const updateDraft = (
    registrationId: number,
    field: "ca" | "exam",
    value: string
  ) => {
    if (value !== "" && !/^\d*\.?\d{0,2}$/.test(value)) return;

    setDrafts((current) => ({
      ...current,
      [registrationId]: {
        ca: current[registrationId]?.ca ?? "",
        exam: current[registrationId]?.exam ?? "",
        [field]: value,
      },
    }));

    setMessage("");
  };

  const saveMarks = async () => {
    setError("");
    setMessage("");

    const candidates = filteredRegistrations.filter((registration) => {
      const draft = drafts[registration.id];

      return Boolean(draft && draft.ca.trim() !== "" && draft.exam.trim() !== "");
    });

    if (candidates.length === 0) {
      setError(
        "Enter both CA and examination marks for at least one student before saving."
      );
      return;
    }

    if (candidates.length > 500) {
      setError(
        "The bulk-save limit is 500 students. Narrow your filters and save in batches."
      );
      return;
    }

    const invalid = candidates.find((registration) => {
      const draft = drafts[registration.id];
      const ca = Number(draft.ca);
      const exam = Number(draft.exam);

      return (
        !Number.isFinite(ca) ||
        !Number.isFinite(exam) ||
        ca < 0 ||
        ca > 30 ||
        exam < 0 ||
        exam > 70
      );
    });

    if (invalid) {
      setError(
        `Invalid marks for ${studentName(invalid)}. CA must be 0–30 and examination must be 0–70.`
      );
      return;
    }

    const approved = window.confirm(
      `Save marks for ${candidates.length} student(s)? Saving marks will make these results unpublished until they are published again.`
    );

    if (!approved) return;

    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/results/bulk`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          results: candidates.map((registration) => ({
            registration_id: registration.id,
            ca_score: Number(drafts[registration.id].ca),
            exam_score: Number(drafts[registration.id].exam),
          })),
        }),
      });

      const data: ApiResponse<unknown> = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/portal";
        return;
      }

      if (!response.ok) {
        throw new Error(getMessage(data, "Unable to save marks."));
      }

      setMessage(
        getMessage(
          data,
          `Marks saved for ${candidates.length} student(s). Publish results when they are ready.`
        )
      );

      await loadRegistrations();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setSaving(false);
    }
  };

  const publishResult = async (registration: Registration) => {
    const result = registration.result;

    if (!result) {
      setError("Save the student's marks before publishing the result.");
      return;
    }

    if (result.ca_score === null || result.exam_score === null) {
      setError("Both CA and examination marks are required before publishing.");
      return;
    }

    if (
      !window.confirm(
        `Publish the result for ${studentName(registration)} (${courseCode(registration.course)})? The student will then be able to view it.`
      )
    ) {
      return;
    }

    setPublishingId(registration.id);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/results/${result.id}/publish`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const data: ApiResponse<unknown> = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/portal";
        return;
      }

      if (!response.ok) {
        throw new Error(getMessage(data, "Unable to publish this result."));
      }

      setMessage(
        getMessage(data, `Result for ${studentName(registration)} published.`)
      );

      await loadRegistrations();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setPublishingId(null);
    }
  };

  const publishAllSaved = async () => {
    const ready = filteredRegistrations.filter(
      (registration) =>
        registration.result &&
        !registration.result.is_published &&
        registration.result.ca_score !== null &&
        registration.result.exam_score !== null
    );

    if (ready.length === 0) {
      setError("There are no saved, unpublished results in the current view.");
      return;
    }

    if (
      !window.confirm(
        `Publish ${ready.length} saved result(s) in the current filtered view?`
      )
    ) {
      return;
    }

    setError("");
    setMessage("");
    setSaving(true);

    let published = 0;
    const failures: string[] = [];

    try {
      const token = localStorage.getItem("token");

      for (const registration of ready) {
        const result = registration.result;
        if (!result) continue;

        const response = await fetch(
          `${API_URL}/results/${result.id}/publish`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        const data: unknown = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/portal";
          return;
        }

        if (response.ok) {
          published += 1;
        } else {
          failures.push(
            `${studentName(registration)}: ${getMessage(data, "Publish failed")}`
          );
        }
      }

      await loadRegistrations();

      if (failures.length > 0) {
        setError(
          `${published} result(s) published. ${failures.length} failed. ${failures.slice(0, 3).join(" | ")}`
        );
      } else {
        setMessage(`${published} result(s) published successfully.`);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while publishing."
      );
    } finally {
      setSaving(false);
    }
  };

  const savedCount = filteredRegistrations.filter(
    (item) => item.result !== null && item.result !== undefined
  ).length;

  const publishedCount = filteredRegistrations.filter(
    (item) => item.result?.is_published
  ).length;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-[#102A43] px-5 py-10 text-white sm:py-14">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">
            COELS SYSTEM · Academic Management
          </p>
          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">
                Results Management
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
                Enter continuous assessment and examination marks, save results
                in bulk, and publish approved results to student portals.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadRegistrations()}
              disabled={loading || saving}
              className="rounded-lg border border-white/30 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh registrations"}
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {message}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Registrations in view</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {filteredRegistrations.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Results saved</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {savedCount}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Results published</p>
            <p className="mt-2 text-3xl font-bold text-green-700">
              {publishedCount}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Filter registrations
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose a course, session, or semester to narrow the mark-entry
              list. Search by student name, registration number, or course.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Course
              </span>
              <select
                value={courseFilter}
                onChange={(event) => setCourseFilter(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
              >
                <option value="all">All courses</option>
                {courses.map(({ id, course }) => (
                  <option key={id} value={String(id)}>
                    {courseCode(course)} — {courseTitle(course)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Academic session
              </span>
              <select
                value={sessionFilter}
                onChange={(event) => setSessionFilter(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
              >
                <option value="all">All sessions</option>
                {sessions.map((session) => (
                  <option key={session} value={session}>
                    {session}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Semester
              </span>
              <select
                value={semesterFilter}
                onChange={(event) => setSemesterFilter(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
              >
                <option value="all">All semesters</option>
                {semesters.map((semester) => (
                  <option key={semester} value={semester}>
                    {semester}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Search
              </span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, Reg. No., course..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900"
              />
            </label>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Student marks
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                CA is out of 30. Examination is out of 70. Total is out of 100.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void publishAllSaved()}
                disabled={loading || saving || filteredRegistrations.length === 0}
                className="rounded-lg border border-green-700 px-4 py-2.5 text-sm font-semibold text-green-800 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Processing..." : "Publish saved results"}
              </button>

              <button
                type="button"
                onClick={() => void saveMarks()}
                disabled={loading || saving || filteredRegistrations.length === 0}
                className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save marks"}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Loading registered students...
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="font-semibold text-slate-800">
                No registrations found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                There are no matching registered students. Try changing the
                filters or register students for courses first.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {[
                      "Student",
                      "Course / Session",
                      "CA / 30",
                      "Exam / 70",
                      "Total / 100",
                      "Publication",
                      "Action",
                    ].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredRegistrations.map((registration) => {
                    const draft = drafts[registration.id] ?? {
                      ca: "",
                      exam: "",
                    };

                    const total = totalScore(draft);
                    const result = registration.result;
                    const published = Boolean(result?.is_published);
                    const publishing = publishingId === registration.id;

                    return (
                      <tr
                        key={registration.id}
                        className="align-top hover:bg-slate-50"
                      >
                        <td className="min-w-56 px-4 py-4">
                          <p className="font-semibold text-slate-900">
                            {studentName(registration)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Reg. No.:{" "}
                            {registration.student_profile
                              ?.registration_number || "Not assigned"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {registration.student_profile?.user?.email || ""}
                          </p>
                        </td>

                        <td className="min-w-56 px-4 py-4">
                          <p className="font-semibold text-slate-800">
                            {courseCode(registration.course)}
                          </p>
                          <p className="mt-1 text-slate-600">
                            {courseTitle(registration.course)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {registration.registration_year} ·{" "}
                            {registration.semester}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {registration.course?.department?.name || ""}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <label className="sr-only" htmlFor={`ca-${registration.id}`}>
                            CA score out of 30
                          </label>
                          <input
                            id={`ca-${registration.id}`}
                            type="number"
                            min="0"
                            max="30"
                            step="0.01"
                            inputMode="decimal"
                            value={draft.ca}
                            onChange={(event) =>
                              updateDraft(
                                registration.id,
                                "ca",
                                event.target.value
                              )
                            }
                            aria-label={`CA score for ${studentName(registration)}`}
                            className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                          />
                        </td>

                        <td className="px-4 py-4">
                          <label className="sr-only" htmlFor={`exam-${registration.id}`}>
                            Examination score out of 70
                          </label>
                          <input
                            id={`exam-${registration.id}`}
                            type="number"
                            min="0"
                            max="70"
                            step="0.01"
                            inputMode="decimal"
                            value={draft.exam}
                            onChange={(event) =>
                              updateDraft(
                                registration.id,
                                "exam",
                                event.target.value
                              )
                            }
                            aria-label={`Exam score for ${studentName(registration)}`}
                            className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                          />
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          <span className="font-bold text-slate-900">
                            {total === null ? "—" : total.toFixed(2)}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          {published ? (
                            <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                              Published
                            </span>
                          ) : result ? (
                            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                              Saved · Unpublished
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              Not saved
                            </span>
                          )}
                          {result && (
                            <p className="mt-2 text-xs text-slate-500">
                              Saved CA: {formatScore(result.ca_score)}
                              <br />
                              Saved Exam: {formatScore(result.exam_score)}
                            </p>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          {result && !published ? (
                            <button
                              type="button"
                              onClick={() => void publishResult(registration)}
                              disabled={saving || publishingId !== null}
                              className="rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {publishing ? "Publishing..." : "Publish"}
                            </button>
                          ) : published ? (
                            <span className="text-xs text-green-700">
                              Available to student
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">
                              Save first
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          <strong>Important:</strong> Saving marks does not publish them.
          Students can only view published results. If you edit and save an
          already published result, it becomes unpublished until authorized
          staff publish it again. The total displayed while entering marks is
          calculated from the current inputs.
        </div>
      </div>
    </main>
  );
}