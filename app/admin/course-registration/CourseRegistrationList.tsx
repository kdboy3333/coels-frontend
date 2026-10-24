"use client";

import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

type RelatedEntity = {
  id?: number;
  name?: string;
  title?: string;
};

type Registration = {
  id: number;
  registration_year: string;
  semester: string;
  status: string;
  student_profile?: {
    id: number;
    registration_number?: string | null;
    admission_number?: string | null;
    first_name?: string;
    middle_name?: string | null;
    last_name?: string;
    user?: { name?: string };
    programme?: RelatedEntity;
    school?: RelatedEntity;
    department?: RelatedEntity;
  };
  course?: {
    id: number;
    course_code?: string | null;
    title: string;
    department?: {
      name?: string;
      school?: {
        name?: string;
        programme?: RelatedEntity;
      };
    };
  };
};

type Props = {
  refreshKey: number;
};

function getToken(): string {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("coels_token") ||
    localStorage.getItem("auth_token") ||
    ""
  );
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed with status ${response.status}.`,
    );
  }

  return data as T;
}

function getStudentName(registration: Registration): string {
  const student = registration.student_profile;

  const fullName = [
    student?.first_name,
    student?.middle_name,
    student?.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  return fullName || student?.user?.name || `Student #${student?.id ?? "?"}`;
}

function getStatusClass(status: string): string {
  switch (status.toLowerCase()) {
    case "approved":
      return "bg-green-100 text-green-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    case "submitted":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function CourseRegistrationList({ refreshKey }: Props) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRegistrations() {
      setLoading(true);
      setError("");

      try {
        const data = await request<{ registrations: Registration[] }>(
          "/admin/course-registrations",
        );

        if (!cancelled) {
          setRegistrations(data.registrations || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load course registrations.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadRegistrations();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  async function removeRegistration(registration: Registration) {
    const studentName = getStudentName(registration);
    const courseTitle = registration.course?.title || "this course";

    if (
      !window.confirm(
        `Remove ${courseTitle} registration for ${studentName}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setRemovingId(registration.id);
    setError("");
    setActionMessage("");

    try {
      const result = await request<{ message: string }>(
        `/admin/course-registrations/${registration.id}`,
        { method: "DELETE" },
      );

      setRegistrations((current) =>
        current.filter((item) => item.id !== registration.id),
      );
      setActionMessage(result.message || "Registration removed.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not remove registration.",
      );
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#102A43]">
          Course Registration Records
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Registrations saved in the COELS database.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {actionMessage && (
        <div
          role="status"
          className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          {actionMessage}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading registrations...</p>
      ) : registrations.length === 0 ? (
        <div className="rounded-xl bg-slate-50 p-8 text-center">
          <p className="font-semibold text-slate-700">
            No course registrations found.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Saved registrations will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {[
                  "Student",
                  "Registration No.",
                  "Department",
                  "Course",
                  "Academic Year",
                  "Semester",
                  "Status",
                  "Action",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 font-semibold text-[#102A43]"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {registrations.map((registration) => {
                const student = registration.student_profile;
                const course = registration.course;

                return (
                  <tr key={registration.id} className="border-b border-slate-100">
                    <td className="px-4 py-4 font-medium text-slate-800">
                      {getStudentName(registration)}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {student?.registration_number ||
                        student?.admission_number ||
                        "Not available"}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {student?.department?.name || "—"}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {course?.course_code
                        ? `${course.course_code} — `
                        : ""}
                      {course?.title || "Course unavailable"}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {registration.registration_year}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {registration.semester}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          registration.status,
                        )}`}
                      >
                        {registration.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        disabled={removingId === registration.id}
                        onClick={() => void removeRegistration(registration)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        {removingId === registration.id
                          ? "Removing..."
                          : "Remove"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}