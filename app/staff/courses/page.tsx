
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = "http://127.0.0.1:8000/api";

type Programme = {
  id: number;
  name: string;
  short_name?: string | null;
};

type School = {
  id: number;
  programme_id?: number | null;
  name: string;
  short_name?: string | null;
};

type Department = {
  id: number;
  school_id: number;
  name: string;
  short_name?: string | null;
};

type Course = {
  id: number;
  department_id: number;
  course_code?: string | null;
  title: string;
  credit_unit: number;
  level?: string | null;
  semester?: string | null;
  description?: string | null;
  is_active: boolean;
  department?: {
    id: number;
    name: string;
    school?: {
      id: number;
      name: string;
      programme?: {
        id: number;
        name: string;
      } | null;
    } | null;
  } | null;
};

type FormData = {
  course_code: string;
  title: string;
  credit_unit: string;
  level: string;
  semester: string;
  description: string;
  is_active: boolean;
};

const emptyForm: FormData = {
  course_code: "",
  title: "",
  credit_unit: "3",
  level: "",
  semester: "",
  description: "",
  is_active: true,
};

async function apiRequest(
  url: string,
  token: string,
  options: RequestInit = {}
) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data?.message ||
      data?.errors?.course_code?.[0] ||
      data?.errors?.title?.[0] ||
      data?.errors?.department_id?.[0] ||
      "Request failed.";

    throw new Error(message);
  }

  return data;
}

export default function StaffCoursesPage() {
  const router = useRouter();

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [programmeId, setProgrammeId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const [form, setForm] = useState<FormData>(emptyForm);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedProgramme = useMemo(
    () => programmes.find((item) => String(item.id) === programmeId),
    [programmes, programmeId]
  );

  const filteredSchools = useMemo(() => {
    if (!programmeId) {
      return schools;
    }

    return schools.filter(
      (school) =>
        school.programme_id === undefined ||
        school.programme_id === null ||
        String(school.programme_id) === programmeId
    );
  }, [schools, programmeId]);

  const filteredDepartments = useMemo(() => {
    if (!schoolId) {
      return [];
    }

    return departments.filter(
      (department) => String(department.school_id) === schoolId
    );
  }, [departments, schoolId]);

  const filteredCourses = useMemo(() => {
    if (!departmentId) {
      return courses;
    }

    return courses.filter(
      (course) => String(course.department_id) === departmentId
    );
  }, [courses, departmentId]);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("coels_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const [
        programmesResponse,
        schoolsResponse,
        departmentsResponse,
        coursesResponse,
      ] = await Promise.all([
        apiRequest(`${API_BASE}/programmes`, token),
        apiRequest(`${API_BASE}/schools`, token),
        apiRequest(`${API_BASE}/departments`, token),
        apiRequest(`${API_BASE}/courses`, token),
      ]);

      setProgrammes(
        programmesResponse.programmes ||
          programmesResponse.data ||
          []
      );

      setSchools(
        schoolsResponse.schools ||
          schoolsResponse.data ||
          []
      );

      setDepartments(
        departmentsResponse.departments ||
          departmentsResponse.data ||
          []
      );

      setCourses(
        coursesResponse.courses ||
          coursesResponse.data ||
          []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load course management data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingCourse(null);
  };

  const handleProgrammeChange = (value: string) => {
    setProgrammeId(value);
    setSchoolId("");
    setDepartmentId("");
  };

  const handleSchoolChange = (value: string) => {
    setSchoolId(value);
    setDepartmentId("");
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);

    const courseDepartmentId = String(course.department_id);
    const department = departments.find(
      (item) => String(item.id) === courseDepartmentId
    );

    if (department) {
      setDepartmentId(String(department.id));
      setSchoolId(String(department.school_id));

      const school = schools.find(
        (item) => String(item.id) === String(department.school_id)
      );

      if (school?.programme_id) {
        setProgrammeId(String(school.programme_id));
      }
    }

    setForm({
      course_code: course.course_code || "",
      title: course.title || "",
      credit_unit: String(course.credit_unit ?? 0),
      level: course.level || "",
      semester: course.semester || "",
      description: course.description || "",
      is_active: Boolean(course.is_active),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!departmentId) {
      setError("Please select a department.");
      return;
    }

    if (!form.title.trim()) {
      setError("Course title is required.");
      return;
    }

    setSaving(true);

    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("coels_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const payload = {
        department_id: Number(departmentId),
        course_code: form.course_code.trim() || null,
        title: form.title.trim(),
        credit_unit: Number(form.credit_unit),
        level: form.level.trim() || null,
        semester: form.semester.trim() || null,
        description: form.description.trim() || null,
        is_active: form.is_active,
      };

      if (editingCourse) {
        await apiRequest(
          `${API_BASE}/hod/courses/${editingCourse.id}`,
          token,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );

        setSuccess("Course updated successfully.");
      } else {
        await apiRequest(`${API_BASE}/hod/courses`, token, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setSuccess("Course created successfully.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save course."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course: Course) => {
    const confirmed = window.confirm(
      `Delete "${course.title}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("coels_token");

      if (!token) {
        router.push("/login");
        return;
      }

      await apiRequest(
        `${API_BASE}/hod/courses/${course.id}`,
        token,
        {
          method: "DELETE",
        }
      );

      if (editingCourse?.id === course.id) {
        resetForm();
      }

      setSuccess("Course deleted successfully.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete course."
      );
    }
  };

  const handleToggleActive = async (course: Course) => {
    setError("");
    setSuccess("");

    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("coels_token");

      if (!token) {
        router.push("/login");
        return;
      }

      await apiRequest(
        `${API_BASE}/hod/courses/${course.id}`,
        token,
        {
          method: "PUT",
          body: JSON.stringify({
            department_id: course.department_id,
            course_code: course.course_code || null,
            title: course.title,
            credit_unit: course.credit_unit,
            level: course.level || null,
            semester: course.semester || null,
            description: course.description || null,
            is_active: !course.is_active,
          }),
        }
      );

      setSuccess(
        course.is_active
          ? "Course deactivated successfully."
          : "Course activated successfully."
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to change course status."
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#C9A227]">
              HOD Portal
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-[#102A43]">
              Course Management
            </h1>

            <p className="mt-2 text-slate-600">
              Add and manage courses for authorised COELS departments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/staff")}
            className="rounded-lg bg-[#102A43] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#163b5c]"
          >
            Back to Staff Dashboard
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
            {success}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-[#102A43]">
                {editingCourse ? "Edit Course" : "Add New Course"}
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Select the academic structure and enter the course details.
              </p>
            </div>

            {editingCourse && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Programme
                </label>

                <select
                  value={programmeId}
                  onChange={(event) =>
                    handleProgrammeChange(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#102A43]"
                >
                  <option value="">Select programme</option>

                  {programmes.map((programme) => (
                    <option key={programme.id} value={programme.id}>
                      {programme.name}
                      {programme.short_name
                        ? ` (${programme.short_name})`
                        : ""}
                    </option>
                  ))}
                </select>

                {selectedProgramme && (
                  <p className="mt-1 text-xs text-slate-500">
                    Selected: {selectedProgramme.name}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  School
                </label>

                <select
                  value={schoolId}
                  onChange={(event) =>
                    handleSchoolChange(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#102A43]"
                >
                  <option value="">Select school</option>

                  {filteredSchools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                      {school.short_name
                        ? ` (${school.short_name})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Department
                </label>

                <select
                  value={departmentId}
                  onChange={(event) =>
                    setDepartmentId(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#102A43]"
                  disabled={!schoolId}
                >
                  <option value="">Select department</option>

                  {filteredDepartments.map((department) => (
                    <option
                      key={department.id}
                      value={department.id}
                    >
                      {department.name}
                      {department.short_name
                        ? ` (${department.short_name})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Course Code
                </label>

                <input
                  type="text"
                  value={form.course_code}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      course_code: event.target.value,
                    })
                  }
                  placeholder="e.g. SWE101"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm uppercase outline-none focus:border-[#102A43]"
                />

                <p className="mt-1 text-xs text-slate-500">
                  Optional where the programme does not require a code.
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Course Title
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title: event.target.value,
                    })
                  }
                  placeholder="e.g. Introduction to Software Engineering"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#102A43]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Credit Unit
                </label>

                <input
                  type="number"
                  min="0"
                  max="255"
                  value={form.credit_unit}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      credit_unit: event.target.value,
                    })
                  }
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#102A43]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Level
                </label>

                <input
                  type="text"
                  value={form.level}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      level: event.target.value,
                    })
                  }
                  placeholder="e.g. NCE 1"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#102A43]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Semester
                </label>

                <select
                  value={form.semester}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      semester: event.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#102A43]"
                >
                  <option value="">Select semester</option>
                  <option value="First Semester">
                    First Semester
                  </option>
                  <option value="Second Semester">
                    Second Semester
                  </option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Optional course description..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#102A43]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        is_active: event.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />

                  <span className="text-sm font-bold text-slate-700">
                    Course is active
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#102A43] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#163b5c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingCourse
                    ? "Update Course"
                    : "Add Course"}
              </button>

              {editingCourse && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-[#102A43]">
                Course List
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                {departmentId
                  ? "Showing courses for the selected department."
                  : "Showing all available courses."}
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
              {filteredCourses.length}{" "}
              {filteredCourses.length === 1 ? "course" : "courses"}
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm font-semibold text-slate-500">
              Loading courses...
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <p className="font-bold text-slate-700">
                No courses found.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Select a department or add a new course above.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Code
                    </th>

                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Course
                    </th>

                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Department
                    </th>

                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Level
                    </th>

                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Semester
                    </th>

                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Unit
                    </th>

                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCourses.map((course) => (
                    <tr
                      key={course.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-4 py-4 text-sm font-bold text-[#102A43]">
                        {course.course_code || "—"}
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-sm font-bold text-[#102A43]">
                          {course.title}
                        </p>

                        {course.description && (
                          <p className="mt-1 max-w-sm text-xs text-slate-500">
                            {course.description}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {course.department?.name || "—"}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {course.level || "—"}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {course.semester || "—"}
                      </td>

                      <td className="px-4 py-4 text-sm font-bold text-slate-700">
                        {course.credit_unit}
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleActive(course)
                          }
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            course.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {course.is_active
                            ? "Active"
                            : "Inactive"}
                        </button>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(course)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-[#102A43] hover:bg-slate-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(course)
                            }
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
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
