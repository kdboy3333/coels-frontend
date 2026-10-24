"use client";

import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

type Student = {
  id: number;
  registration_number?: string | null;
  admission_number?: string | null;
  first_name?: string;
  middle_name?: string | null;
  last_name?: string;
  department_id: number;
  user?: { name?: string; email?: string };
  department?: { name?: string };
};

type Course = {
  id: number;
  department_id: number;
  course_code?: string | null;
  title: string;
  semester?: string | null;
  is_active: boolean;
  department?: { name?: string };
};

type Props = {
  onSaved: () => void;
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

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const validationErrors = data.errors
      ? Object.values(data.errors).flat().join(" ")
      : "";

    throw new Error(
      validationErrors ||
        data.message ||
        `Request failed with status ${response.status}.`,
    );
  }

  return data as T;
}

export default function CourseRegistrationForm({ onSaved }: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [registrationYear, setRegistrationYear] = useState("");
  const [semester, setSemester] = useState("First Semester");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadOptions() {
      setLoading(true);
      setError("");

      try {
        const [studentData, courseData] = await Promise.all([
          request<{ students: Student[] }>("/admin/students"),
          request<Course[]>("/courses"),
        ]);

        setStudents(studentData.students || []);
        setCourses(
          (Array.isArray(courseData) ? courseData : []).filter(
            (course) => course.is_active,
          ),
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not load form data.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadOptions();
  }, []);

  const selectedStudent = students.find(
    (student) => String(student.id) === studentId,
  );

  const availableCourses = courses.filter(
    (course) =>
      selectedStudent &&
      Number(course.department_id) ===
        Number(selectedStudent.department_id),
  );

  function studentLabel(student: Student): string {
    const fullName = [
      student.first_name,
      student.middle_name,
      student.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      fullName ||
      student.user?.name ||
      student.registration_number ||
      student.admission_number ||
      `Student #${student.id}`
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!studentId || !courseId || !registrationYear.trim() || !semester) {
      setError("Please complete all required fields.");
      return;
    }

    setSaving(true);

    try {
      const result = await request<{ message: string }>(
        "/admin/course-registrations",
        {
          method: "POST",
          body: JSON.stringify({
            student_profile_id: Number(studentId),
            course_id: Number(courseId),
            registration_year: registrationYear.trim(),
            semester,
          }),
        },
      );

      setMessage(result.message || "Registration saved successfully.");
      setCourseId("");
      onSaved();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save registration.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#102A43]">
          Register a Student for a Course
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose a student and an active course from their department.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading students and courses...</p>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label
              htmlFor="registration-student"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Student *
            </label>
            <select
              id="registration-student"
              required
              value={studentId}
              onChange={(event) => {
                setStudentId(event.target.value);
                setCourseId("");
              }}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {studentLabel(student)}
                  {" — "}
                  {student.registration_number ||
                    student.admission_number ||
                    `ID ${student.id}`}
                </option>
              ))}
            </select>
            {students.length === 0 && (
              <p className="mt-2 text-sm text-amber-700">
                No student profiles were returned by the API.
              </p>
            )}
          </div>

          {selectedStudent && (
            <div className="md:col-span-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              <p>
                <strong>Department:</strong>{" "}
                {selectedStudent.department?.name || "Department not specified"}
              </p>
              <p className="mt-1">
                <strong>Registration number:</strong>{" "}
                {selectedStudent.registration_number || "Not generated"}
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="registration-year"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Academic year / session *
            </label>
            <input
              id="registration-year"
              required
              maxLength={20}
              value={registrationYear}
              onChange={(event) => setRegistrationYear(event.target.value)}
              placeholder="e.g. 2026/2027"
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            />
          </div>

          <div>
            <label
              htmlFor="registration-semester"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Semester *
            </label>
            <select
              id="registration-semester"
              required
              value={semester}
              onChange={(event) => setSemester(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
            >
              <option value="First Semester">First Semester</option>
              <option value="Second Semester">Second Semester</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="registration-course"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Course *
            </label>
            <select
              id="registration-course"
              required
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              disabled={!studentId}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 disabled:bg-slate-100"
            >
              <option value="">
                {studentId
                  ? "Select course"
                  : "Select a student first"}
              </option>
              {availableCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.course_code ? `${course.course_code} — ` : ""}
                  {course.title}
                  {course.semester ? ` (${course.semester})` : ""}
                </option>
              ))}
            </select>
            {studentId && availableCourses.length === 0 && (
              <p className="mt-2 text-sm text-amber-700">
                No active courses were found for this student&apos;s department.
              </p>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {message && (
            <div
              role="status"
              className="md:col-span-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
            >
              {message}
            </div>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving || loading || students.length === 0}
              className="rounded-xl bg-[#102A43] px-6 py-3 font-semibold text-white transition hover:bg-[#243B53] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Course Registration"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}