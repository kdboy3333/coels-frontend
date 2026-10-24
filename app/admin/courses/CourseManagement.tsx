"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

type Department = {
  id: number;
  name: string;
  school_id: number;
  short_name?: string | null;
  is_active?: boolean | number;
  school?: {
    id: number;
    name: string;
    programme?: {
      id: number;
      name: string;
    } | null;
  } | null;
};

type Course = {
  id: number;
  department_id: number;
  course_code: string | null;
  title: string;
  credit_unit: number;
  level: string | null;
  semester: string | null;
  description: string | null;
  is_active: boolean | number;
  department?: Department | null;
};

type ApiResponse = {
  message?: string;
  courses?: Course[];
  departments?: Department[];
  errors?: Record<string, string[]>;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

function token(): string | null {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("coels_token") ||
    localStorage.getItem("auth_token")
  );
}

function headers(): HeadersInit {
  const savedToken = token();

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(savedToken
      ? { Authorization: `Bearer ${savedToken}` }
      : {}),
  };
}

async function apiResponse(response: Response): Promise<ApiResponse> {
  let data: ApiResponse;

  try {
    data = (await response.json()) as ApiResponse;
  } catch {
    throw new Error(
      "Invalid server response. Make sure the Laravel backend is running."
    );
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    if (response.status === 403) {
      throw new Error(
        "Access denied. Sign in with an authorised COELS account."
      );
    }

    const validationErrors = data.errors
      ? Object.values(data.errors).flat().join(" ")
      : "";

    throw new Error(
      validationErrors || data.message || "The request failed."
    );
  }

  return data;
}

function active(value: boolean | number | undefined): boolean {
  return value === true || value === 1;
}

const fieldClass =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20";

const labelClass = "block text-sm font-medium text-slate-700";

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [departmentId, setDepartmentId] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [title, setTitle] = useState("");
  const [creditUnit, setCreditUnit] = useState("3");
  const [level, setLevel] = useState("");
  const [semester, setSemester] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workingId, setWorkingId] = useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [coursesResponse, departmentsResponse] = await Promise.all([
        fetch(`${API_URL}/courses`, {
          headers: headers(),
          cache: "no-store",
        }),
        fetch(`${API_URL}/departments`, {
          headers: headers(),
          cache: "no-store",
        }),
      ]);

      const [coursesData, departmentsData] = await Promise.all([
        apiResponse(coursesResponse),
        apiResponse(departmentsResponse),
      ]);

      setCourses(
        Array.isArray(coursesData.courses) ? coursesData.courses : []
      );

      const items = Array.isArray(departmentsData.departments)
        ? departmentsData.departments
        : [];

      setDepartments(items);

      setDepartmentId((current) => {
        if (items.some((item) => String(item.id) === current)) {
          return current;
        }

        const preferred = items.find((item) => active(item.is_active));

        return String(preferred?.id ?? items[0]?.id ?? "");
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load courses from the database."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function resetForm() {
    setEditingId(null);
    setCourseCode("");
    setTitle("");
    setCreditUnit("3");
    setLevel("");
    setSemester("");
    setDescription("");
    setIsActive(true);
  }

  function editCourse(course: Course) {
    setEditingId(course.id);
    setDepartmentId(String(course.department_id));
    setCourseCode(course.course_code ?? "");
    setTitle(course.title);
    setCreditUnit(String(course.credit_unit));
    setLevel(course.level ?? "");
    setSemester(course.semester ?? "");
    setDescription(course.description ?? "");
    setIsActive(active(course.is_active));
    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!token()) {
      setError("Please sign in before saving a course.");
      return;
    }

    if (!departmentId) {
      setError("Select a department first.");
      return;
    }

    if (!title.trim()) {
      setError("Course title is required.");
      return;
    }

    const units = Number(creditUnit);

    if (
      creditUnit.trim() === "" ||
      !Number.isInteger(units) ||
      units < 0 ||
      units > 255
    ) {
      setError("Credit unit must be a whole number between 0 and 255.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        department_id: Number(departmentId),
        course_code: courseCode.trim() || null,
        title: title.trim(),
        credit_unit: units,
        level: level.trim() || null,
        semester: semester.trim() || null,
        description: description.trim() || null,
        is_active: isActive,
      };

      const response = await fetch(
        editingId
          ? `${API_URL}/courses/${editingId}`
          : `${API_URL}/courses`,
        {
          method: editingId ? "PUT" : "POST",
          headers: headers(),
          body: JSON.stringify(payload),
        }
      );

      const data = await apiResponse(response);

      setMessage(
        data.message ||
          (editingId
            ? "Course updated successfully."
            : "Course created successfully.")
      );

      resetForm();
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save the course."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(course: Course) {
    setMessage("");
    setError("");

    if (!token()) {
      setError("Please sign in before changing course status.");
      return;
    }

    setWorkingId(course.id);

    try {
      const response = await fetch(`${API_URL}/courses/${course.id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({
          department_id: course.department_id,
          course_code: course.course_code,
          title: course.title,
          credit_unit: course.credit_unit,
          level: course.level,
          semester: course.semester,
          description: course.description,
          is_active: !active(course.is_active),
        }),
      });

      const data = await apiResponse(response);

      setMessage(data.message || "Course status updated successfully.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update course."
      );
    } finally {
      setWorkingId(null);
    }
  }

  async function deleteCourse(course: Course) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${course.title}"?`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    if (!token()) {
      setError("Please sign in before deleting a course.");
      return;
    }

    setWorkingId(course.id);

    try {
      const response = await fetch(`${API_URL}/courses/${course.id}`, {
        method: "DELETE",
        headers: headers(),
      });

      const data = await apiResponse(response);

      if (editingId === course.id) {
        resetForm();
      }

      setMessage(data.message || "Course deleted successfully.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete course."
      );
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#C9A227]">
          Academic Structure
        </p>

        <h2 className="mt-2 text-2xl font-bold text-[#102A43]">
          {editingId ? "Edit Course" : "Add Course"}
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Manage courses and link them to the correct department.
        </p>

        <form onSubmit={saveCourse} className="mt-6 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className={labelClass}>
              Department *
              <select
                required
                value={departmentId}
                onChange={(event) => setDepartmentId(event.target.value)}
                disabled={departments.length === 0}
                className={fieldClass}
              >
                <option value="">Select department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                    {department.school?.name
                      ? ` — ${department.school.name}`
                      : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className={labelClass}>
              Course title *
              <input
                required
                maxLength={255}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Introduction to Programming"
                className={fieldClass}
              />
            </label>

            <label className={labelClass}>
              Course code
              <input
                maxLength={50}
                value={courseCode}
                onChange={(event) => setCourseCode(event.target.value)}
                placeholder="e.g. CSC101"
                className={fieldClass}
              />
              <span className="mt-1 block text-xs font-normal text-slate-500">
                Optional. Must be unique within its department.
              </span>
            </label>

            <label className={labelClass}>
              Credit unit *
              <input
                required
                type="number"
                min={0}
                max={255}
                step={1}
                value={creditUnit}
                onChange={(event) => setCreditUnit(event.target.value)}
                className={fieldClass}
              />
            </label>

            <label className={labelClass}>
              Level
              <input
                maxLength={50}
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                placeholder="e.g. 100 Level"
                className={fieldClass}
              />
            </label>

            <label className={labelClass}>
              Semester
              <select
                value={semester}
                onChange={(event) => setSemester(event.target.value)}
                className={fieldClass}
              >
                <option value="">Select semester (optional)</option>
                <option value="First Semester">First Semester</option>
                <option value="Second Semester">Second Semester</option>
                <option value="First">First</option>
                <option value="Second">Second</option>
              </select>
            </label>
          </div>

          <label className={labelClass}>
            Description
            <textarea
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional course description"
              className={fieldClass}
            />
          </label>

          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4 accent-[#102A43]"
            />
            Course is active
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving || departments.length === 0}
              className="rounded-xl bg-[#102A43] px-6 py-3 font-semibold text-white hover:bg-[#243B53] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save Changes"
                  : "Add Course"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {!loading && departments.length === 0 && (
            <p className="text-sm text-amber-700">
              Add a department on the Schools &amp; Departments page first.
            </p>
          )}
        </form>
      </section>

      {message && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#102A43]">
              Course Records
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Records loaded from the COELS database.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:border-[#C9A227] disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-slate-500">
            Loading courses...
          </p>
        ) : courses.length === 0 ? (
          <p className="py-8 text-center text-slate-500">
            No courses found. Add your first course above.
          </p>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => {
              const department =
                course.department ??
                departments.find(
                  (item) => item.id === course.department_id
                );

              const courseIsActive = active(course.is_active);

              return (
                <article
                  key={course.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-800">
                          {course.title}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            courseIsActive
                              ? "bg-green-100 text-green-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {courseIsActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                        <p>
                          <strong>Course code:</strong>{" "}
                          {course.course_code || "Not assigned"}
                        </p>

                        <p>
                          <strong>Credit units:</strong> {course.credit_unit}
                        </p>

                        <p>
                          <strong>Department:</strong>{" "}
                          {department?.name ||
                            `Department ID ${course.department_id}`}
                        </p>

                        <p>
                          <strong>School:</strong>{" "}
                          {department?.school?.name || "Not available"}
                        </p>

                        <p>
                          <strong>Level:</strong>{" "}
                          {course.level || "Not specified"}
                        </p>

                        <p>
                          <strong>Semester:</strong>{" "}
                          {course.semester || "Not specified"}
                        </p>
                      </div>

                      {course.description && (
                        <p className="mt-3 whitespace-pre-wrap text-sm text-slate-500">
                          {course.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => editCourse(course)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-[#C9A227]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={workingId === course.id}
                        onClick={() => void toggleStatus(course)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
                      >
                        {workingId === course.id
                          ? "Working..."
                          : courseIsActive
                            ? "Deactivate"
                            : "Activate"}
                      </button>

                      <button
                        type="button"
                        disabled={workingId === course.id}
                        onClick={() => void deleteCourse(course)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        {workingId === course.id ? "Working..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}