"use client";

import { useCallback, useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

type AcademicEntity = {
  id?: number;
  name?: string;
  title?: string;
};

type Student = {
  id?: number;
  registration_number?: string | null;
  admission_number?: string | null;
  academic_session?: string | null;
  registration_year?: string | null;
  current_level?: string | null;
  current_semester?: string | null;
  programme?: AcademicEntity | string | null;
  school?: AcademicEntity | string | null;
  department?: AcademicEntity | string | null;
};

type Course = {
  id: number;
  department_id: number;
  course_code: string | null;
  title: string;
  credit_unit: number;
  level: string | null;
  semester: string | null;
  registration_semester?: string | null;
  description: string | null;
  is_active: boolean;
  is_registered?: boolean;
  registration_status?: string | null;
};

type Registration = {
  id: number;
  student_profile_id: number;
  course_id: number;
  registration_year: string;
  semester: string;
  status: string;
  course?: Course | null;
};

type ApiError = {
  message?: string;
  errors?: Record<string, string[]>;
};

function readToken(): string | null {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("coels_token") ||
    localStorage.getItem("auth_token")
  );
}

function entityName(value: AcademicEntity | string | null | undefined): string {
  if (!value) return "—";
  if (typeof value === "string") return value;
  return value.name || value.title || "—";
}

function display(value: string | number | null | undefined): string {
  if (value === null || value === undefined || String(value).trim() === "") {
    return "—";
  }

  return String(value);
}

function sameValue(first?: string | null, second?: string | null): boolean {
  return (
    String(first ?? "").trim().toLowerCase() ===
    String(second ?? "").trim().toLowerCase()
  );
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiError;

    if (data.errors) {
      const firstError = Object.values(data.errors).flat()[0];
      if (firstError) return firstError;
    }

    return data.message || `Request failed (${response.status}).`;
  } catch {
    return `Request failed (${response.status}).`;
  }
}

export default function StudentCourseRegistrationPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingCourseId, setSavingCourseId] = useState<number | null>(null);
  const [removingRegistrationId, setRemovingRegistrationId] = useState<
    number | null
  >(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    const token = readToken();

    if (!token) {
      setError("Your login session was not found. Please sign in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      const [coursesResponse, registrationsResponse] = await Promise.all([
        fetch(`${API_URL}/student/available-courses`, {
          method: "GET",
          headers,
          cache: "no-store",
        }),
        fetch(`${API_URL}/student/course-registrations`, {
          method: "GET",
          headers,
          cache: "no-store",
        }),
      ]);

      if (!coursesResponse.ok) {
        throw new Error(await getErrorMessage(coursesResponse));
      }

      if (!registrationsResponse.ok) {
        throw new Error(await getErrorMessage(registrationsResponse));
      }

      const coursesData = await coursesResponse.json();
      const registrationsData = await registrationsResponse.json();

      const profile: Student | null =
        coursesData.student || registrationsData.student || null;

      const availableCourses: Course[] = Array.isArray(coursesData.courses)
        ? coursesData.courses
        : [];

      const allRegistrations: Registration[] = Array.isArray(
        registrationsData.registrations
      )
        ? registrationsData.registrations
        : [];

      setStudent(profile);
      setRegistrations(allRegistrations);

      // Apply eligibility filters on the client as an additional safeguard.
      // The backend remains responsible for enforcing eligibility.
      const eligibleCourses = availableCourses.filter((course) => {
        if (course.is_active === false) return false;

        if (
          student &&
          student.id !== undefined &&
          course.department_id === undefined
        ) {
          return false;
        }

        if (
          profile?.current_level &&
          course.level &&
          !sameValue(profile.current_level, course.level)
        ) {
          return false;
        }

        if (
          profile?.current_semester &&
          course.semester &&
          !sameValue(profile.current_semester, course.semester)
        ) {
          return false;
        }

        return true;
      });

      setCourses(eligibleCourses);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load course registration information."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const academicSession =
    student?.academic_session?.trim() ||
    student?.registration_year?.trim() ||
    "";

  const currentSemester = student?.current_semester?.trim() || "";

  const registeredCourseIds = new Set(
    registrations
      .filter((registration) => {
        if (
          academicSession &&
          !sameValue(registration.registration_year, academicSession)
        ) {
          return false;
        }

        if (
          currentSemester &&
          !sameValue(registration.semester, currentSemester)
        ) {
          return false;
        }

        return true;
      })
      .map((registration) => registration.course_id)
  );

  const visibleCourses = courses.filter((course) => {
    const term = search.trim().toLowerCase();

    if (!term) return true;

    return (
      (course.course_code || "").toLowerCase().includes(term) ||
      course.title.toLowerCase().includes(term) ||
      (course.description || "").toLowerCase().includes(term)
    );
  });

  const registeredCount = courses.filter(
    (course) =>
      registeredCourseIds.has(course.id) ||
      course.is_registered === true
  ).length;

  async function registerCourse(course: Course) {
    const token = readToken();

    if (!token) {
      setError("Your login session has expired. Please sign in again.");
      return;
    }

    if (!student?.registration_number) {
      setError(
        "You need a permanent registration number before registering courses. Please contact the appropriate COELS office."
      );
      return;
    }

    if (!academicSession) {
      setError(
        "Your academic session has not been assigned. Please contact your department."
      );
      return;
    }

    if (registeredCourseIds.has(course.id) || course.is_registered) {
      setNotice("You have already registered for this course.");
      return;
    }

    const semester =
      course.registration_semester ||
      course.semester ||
      currentSemester;

    if (!semester) {
      setError(
        "The semester for this course has not been configured. Please contact your department."
      );
      return;
    }

    if (
      currentSemester &&
      course.semester &&
      !sameValue(currentSemester, course.semester)
    ) {
      setError("This course is not assigned to your current semester.");
      return;
    }

    setSavingCourseId(course.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/student/course-registrations`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            course_id: course.id,
            registration_year: academicSession,
            semester,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      setNotice(`${course.course_code || course.title} registered successfully.`);
      await loadData();
    } catch (registerError) {
      setError(
        registerError instanceof Error
          ? registerError.message
          : "Unable to register this course."
      );
    } finally {
      setSavingCourseId(null);
    }
  }

  async function removeRegistration(registration: Registration) {
    const token = readToken();

    if (!token) {
      setError("Your login session has expired. Please sign in again.");
      return;
    }

    if (
      academicSession &&
      !sameValue(registration.registration_year, academicSession)
    ) {
      setError("Only registrations from your current academic session can be removed here.");
      return;
    }

    if (
      currentSemester &&
      !sameValue(registration.semester, currentSemester)
    ) {
      setError("Only registrations from your current semester can be removed here.");
      return;
    }

    const courseName =
      registration.course?.course_code ||
      registration.course?.title ||
      "this course";

    if (!window.confirm(`Remove your registration for ${courseName}?`)) {
      return;
    }

    setRemovingRegistrationId(registration.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/student/course-registrations/${registration.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      setNotice(`${courseName} registration removed.`);
      await loadData();
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Unable to remove this registration."
      );
    } finally {
      setRemovingRegistrationId(null);
    }
  }

  const currentRegistrations = registrations.filter((registration) => {
    if (
      academicSession &&
      !sameValue(registration.registration_year, academicSession)
    ) {
      return false;
    }

    if (
      currentSemester &&
      !sameValue(registration.semester, currentSemester)
    ) {
      return false;
    }

    return true;
  });

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
              Student Portal
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Course Registration
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Review courses assigned to your department and register for the
              courses available at your current academic level and semester.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh courses"}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            <p className="font-semibold">Unable to continue</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            {notice}
          </div>
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            label="Registration Number"
            value={student?.registration_number || "Not assigned"}
          />
          <InfoCard
            label="Academic Session"
            value={academicSession || "Not assigned"}
          />
          <InfoCard
            label="Current Level"
            value={student?.current_level || "Not assigned"}
          />
          <InfoCard
            label="Current Semester"
            value={currentSemester || "Not assigned"}
          />
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">
            Academic Information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <Detail
              label="Programme"
              value={entityName(student?.programme)}
            />
            <Detail label="School" value={entityName(student?.school)} />
            <Detail
              label="Department"
              value={entityName(student?.department)}
            />
          </div>
        </section>

        {!loading && student && !academicSession && (
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Your academic session has not been configured. You can view courses,
            but registration cannot proceed until your department assigns your
            session.
          </div>
        )}

        {!loading && student && !currentSemester && (
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Your current semester is not assigned. Courses with no configured
            semester cannot be registered until your student profile or course
            setup is corrected.
          </div>
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="Available Courses" value={courses.length} />
          <StatCard label="Registered Courses" value={registeredCount} />
          <StatCard
            label="Remaining Courses"
            value={Math.max(courses.length - registeredCount, 0)}
          />
        </section>

        <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Available Courses
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Only active courses returned for your student profile are shown.
              </p>
            </div>

            <div className="w-full sm:max-w-xs">
              <label
                htmlFor="course-search"
                className="sr-only"
              >
                Search courses
              </label>
              <input
                id="course-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search course code or title..."
                className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {loading ? (
            <LoadingMessage message="Loading available courses..." />
          ) : visibleCourses.length === 0 ? (
            <EmptyMessage
              title="No available courses"
              message={
                search
                  ? "No courses match your search. Try another course code or title."
                  : "There are no active courses available for your department, level and semester at the moment. Please contact your department if you think this is incorrect."
              }
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {visibleCourses.map((course) => {
                const alreadyRegistered =
                  registeredCourseIds.has(course.id) ||
                  course.is_registered === true;

                const isSaving = savingCourseId === course.id;

                return (
                  <article
                    key={course.id}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800">
                          {display(course.course_code)}
                        </span>

                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {course.credit_unit} credit unit
                          {course.credit_unit === 1 ? "" : "s"}
                        </span>

                        {alreadyRegistered && (
                          <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                            Registered
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 text-lg font-bold text-slate-900">
                        {course.title}
                      </h3>

                      {course.description && (
                        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                          {course.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                        <span>Level: {display(course.level || student?.current_level)}</span>
                        <span>
                          Semester:{" "}
                          {display(
                            course.registration_semester ||
                              course.semester ||
                              currentSemester
                          )}
                        </span>
                        <span>
                          Session: {display(academicSession)}
                        </span>
                      </div>
                    </div>

                    <div className="sm:shrink-0">
                      <button
                        type="button"
                        onClick={() => void registerCourse(course)}
                        disabled={
                          alreadyRegistered ||
                          isSaving ||
                          savingCourseId !== null ||
                          !academicSession ||
                          !student?.registration_number
                        }
                        className={`inline-flex min-h-11 w-full items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition sm:w-auto ${
                          alreadyRegistered
                            ? "cursor-not-allowed bg-emerald-100 text-emerald-800"
                            : "bg-blue-700 text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                        }`}
                      >
                        {alreadyRegistered
                          ? "Already Registered"
                          : isSaving
                            ? "Registering..."
                            : "Register Course"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <h2 className="text-xl font-bold text-slate-900">
              My Current Registrations
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Courses registered for your assigned session and semester.
            </p>
          </div>

          {loading ? (
            <LoadingMessage message="Loading your registrations..." />
          ) : currentRegistrations.length === 0 ? (
            <EmptyMessage
              title="No current registrations"
              message="Your registered courses will appear here after you successfully register."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                      Course
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                      Credit Units
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                      Semester
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                      Status
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {currentRegistrations.map((registration) => (
                    <tr key={registration.id}>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {registration.course?.title ||
                            `Course #${registration.course_id}`}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {registration.course?.course_code || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {display(registration.course?.credit_unit)}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {display(registration.semester)}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-800">
                          {display(registration.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            void removeRegistration(registration)
                          }
                          disabled={
                            removingRegistrationId === registration.id ||
                            savingCourseId !== null
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {removingRegistrationId === registration.id
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-words text-lg font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function LoadingMessage({ message }: { message: string }) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />
      <p className="mt-4 text-sm text-slate-600">{message}</p>
    </div>
  );
}

function EmptyMessage({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7h8M8 12h8M8 17h5M5 3.75h14A1.25 1.25 0 0 1 20.25 5v14A1.25 1.25 0 0 1 19 20.25H5A1.25 1.25 0 0 1 3.75 19V5A1.25 1.25 0 0 1 5 3.75Z"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        {message}
      </p>
    </div>
  );
}