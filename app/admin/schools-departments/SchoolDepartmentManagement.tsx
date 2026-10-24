"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiUrl, authHeaders, getAuthToken } from "../../../lib/api";

type Programme = {
  id: number;
  name: string;
  short_name: string | null;
  is_active: boolean;
};

type School = {
  id: number;
  programme_id: number;
  name: string;
  short_name: string | null;
  description: string | null;
  is_active: boolean;
  programme?: Programme | null;
};

type Department = {
  id: number;
  school_id: number;
  name: string;
  short_name: string | null;
  description: string | null;
  is_active: boolean;
  school?: School | null;
};

type ApiResponse = {
  message?: string;
  programmes?: Programme[];
  schools?: School[];
  departments?: Department[];
  errors?: Record<string, string[]>;
};

function requestHeaders(): Record<string, string> {
  return authHeaders({ "Content-Type": "application/json" });
}

async function readResponse<T extends ApiResponse>(
  response: Response,
): Promise<T> {
  let data: T;

  try {
    data = (await response.json()) as T;
  } catch {
    throw new Error(
      response.ok
        ? "The server returned an invalid response."
        : `The server request failed with status ${response.status}.`,
    );
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    if (response.status === 403) {
      throw new Error("You do not have permission to perform this action.");
    }

    const validationMessage = data.errors
      ? Object.values(data.errors).flat().join(" ")
      : "";

    throw new Error(
      validationMessage || data.message || "The request failed.",
    );
  }

  return data;
}

export default function SchoolDepartmentManagement() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [schoolName, setSchoolName] = useState("");
  const [schoolShortName, setSchoolShortName] = useState("");
  const [schoolDescription, setSchoolDescription] = useState("");
  const [schoolProgrammeId, setSchoolProgrammeId] = useState("");

  const [departmentName, setDepartmentName] = useState("");
  const [departmentShortName, setDepartmentShortName] = useState("");
  const [departmentDescription, setDepartmentDescription] = useState("");
  const [departmentSchoolId, setDepartmentSchoolId] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingSchool, setSavingSchool] = useState(false);
  const [savingDepartment, setSavingDepartment] = useState(false);
  const [updatingSchoolId, setUpdatingSchoolId] = useState<number | null>(null);
  const [updatingDepartmentId, setUpdatingDepartmentId] = useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [programmeResponse, schoolResponse, departmentResponse] =
        await Promise.all([
          fetch(apiUrl("programmes"), {
            headers: requestHeaders(),
            cache: "no-store",
          }),
          fetch(apiUrl("schools"), {
            headers: requestHeaders(),
            cache: "no-store",
          }),
          fetch(apiUrl("departments"), {
            headers: requestHeaders(),
            cache: "no-store",
          }),
        ]);

      const [programmeData, schoolData, departmentData] = await Promise.all([
        readResponse<ApiResponse>(programmeResponse),
        readResponse<ApiResponse>(schoolResponse),
        readResponse<ApiResponse>(departmentResponse),
      ]);

      const nextProgrammes = Array.isArray(programmeData.programmes)
        ? programmeData.programmes
        : [];

      const nextSchools = Array.isArray(schoolData.schools)
        ? schoolData.schools
        : [];

      const nextDepartments = Array.isArray(departmentData.departments)
        ? departmentData.departments
        : [];

      setProgrammes(nextProgrammes);
      setSchools(nextSchools);
      setDepartments(nextDepartments);

      setSchoolProgrammeId((current) => {
        if (current && nextProgrammes.some((item) => String(item.id) === current)) {
          return current;
        }

        const active = nextProgrammes.find((item) => item.is_active);
        return String(active?.id ?? nextProgrammes[0]?.id ?? "");
      });

      setDepartmentSchoolId((current) => {
        if (current && nextSchools.some((item) => String(item.id) === current)) {
          return current;
        }

        const active = nextSchools.find((item) => item.is_active);
        return String(active?.id ?? nextSchools[0]?.id ?? "");
      });
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Unable to connect to the COELS server. Check that the backend is running."
          : err instanceof Error
            ? err.message
            : "Could not load academic structure.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function addSchool(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!getAuthToken()) {
      setError("Please sign in before adding a school.");
      return;
    }

    if (!schoolProgrammeId) {
      setError("Create or select a programme before adding a school.");
      return;
    }

    if (!schoolName.trim()) {
      setError("School name is required.");
      return;
    }

    setSavingSchool(true);

    try {
      const response = await fetch(apiUrl("schools"), {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify({
          programme_id: Number(schoolProgrammeId),
          name: schoolName.trim(),
          short_name: schoolShortName.trim() || null,
          description: schoolDescription.trim() || null,
          is_active: true,
        }),
      });

      const data = await readResponse<ApiResponse>(response);

      setSchoolName("");
      setSchoolShortName("");
      setSchoolDescription("");
      setMessage(data.message || "School created successfully.");

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create school.");
    } finally {
      setSavingSchool(false);
    }
  }

  async function addDepartment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!getAuthToken()) {
      setError("Please sign in before adding a department.");
      return;
    }

    if (!departmentSchoolId) {
      setError("Create or select a school before adding a department.");
      return;
    }

    if (!departmentName.trim()) {
      setError("Department name is required.");
      return;
    }

    setSavingDepartment(true);

    try {
      const response = await fetch(apiUrl("departments"), {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify({
          school_id: Number(departmentSchoolId),
          name: departmentName.trim(),
          short_name: departmentShortName.trim() || null,
          description: departmentDescription.trim() || null,
          is_active: true,
        }),
      });

      const data = await readResponse<ApiResponse>(response);

      setDepartmentName("");
      setDepartmentShortName("");
      setDepartmentDescription("");
      setMessage(data.message || "Department created successfully.");

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create department.",
      );
    } finally {
      setSavingDepartment(false);
    }
  }

  async function toggleSchool(school: School) {
    setMessage("");
    setError("");

    if (!getAuthToken()) {
      setError("Please sign in before updating a school.");
      return;
    }

    setUpdatingSchoolId(school.id);

    try {
      const response = await fetch(apiUrl(`schools/${school.id}`), {
        method: "PUT",
        headers: requestHeaders(),
        body: JSON.stringify({
          programme_id: school.programme_id,
          name: school.name,
          short_name: school.short_name,
          description: school.description,
          is_active: !school.is_active,
        }),
      });

      const data = await readResponse<ApiResponse>(response);
      setMessage(data.message || "School status updated successfully.");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update school.");
    } finally {
      setUpdatingSchoolId(null);
    }
  }

  async function toggleDepartment(department: Department) {
    setMessage("");
    setError("");

    if (!getAuthToken()) {
      setError("Please sign in before updating a department.");
      return;
    }

    setUpdatingDepartmentId(department.id);

    try {
      const response = await fetch(
        apiUrl(`departments/${department.id}`),
        {
          method: "PUT",
          headers: requestHeaders(),
          body: JSON.stringify({
            school_id: department.school_id,
            name: department.name,
            short_name: department.short_name,
            description: department.description,
            is_active: !department.is_active,
          }),
        },
      );

      const data = await readResponse<ApiResponse>(response);
      setMessage(data.message || "Department status updated successfully.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update department.",
      );
    } finally {
      setUpdatingDepartmentId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <form
          onSubmit={addSchool}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold text-[#102A43]">Add School</h2>
          <p className="mt-1 text-sm text-slate-500">
            Each school must belong to an existing programme.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Programme *
              <select
                required
                value={schoolProgrammeId}
                onChange={(event) => setSchoolProgrammeId(event.target.value)}
                disabled={programmes.length === 0}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="">Select programme</option>
                {programmes.map((programme) => (
                  <option key={programme.id} value={programme.id}>
                    {programme.name}
                    {programme.short_name ? ` (${programme.short_name})` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              School name *
              <input
                required
                maxLength={255}
                value={schoolName}
                onChange={(event) => setSchoolName(event.target.value)}
                placeholder="e.g. School of Science"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Short name
              <input
                maxLength={50}
                value={schoolShortName}
                onChange={(event) => setSchoolShortName(event.target.value)}
                placeholder="Optional abbreviation"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Description
              <textarea
                rows={3}
                value={schoolDescription}
                onChange={(event) => setSchoolDescription(event.target.value)}
                placeholder="Optional school description"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </label>

            <button
              type="submit"
              disabled={savingSchool || programmes.length === 0}
              className="w-full rounded-xl bg-[#102A43] px-5 py-3 font-semibold text-white hover:bg-[#243B53] disabled:opacity-50"
            >
              {savingSchool ? "Saving..." : "Add School"}
            </button>

            {programmes.length === 0 && !loading && (
              <p className="text-sm text-amber-700">
                Add a programme first on the Programme Management page.
              </p>
            )}
          </div>
        </form>

        <form
          onSubmit={addDepartment}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold text-[#102A43]">Add Department</h2>
          <p className="mt-1 text-sm text-slate-500">
            Each department is linked to a school in the database.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              School *
              <select
                required
                value={departmentSchoolId}
                onChange={(event) => setDepartmentSchoolId(event.target.value)}
                disabled={schools.length === 0}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="">Select school</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                    {school.programme?.name
                      ? ` — ${school.programme.name}`
                      : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Department name *
              <input
                required
                maxLength={255}
                value={departmentName}
                onChange={(event) => setDepartmentName(event.target.value)}
                placeholder="e.g. Computer Science"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Short name
              <input
                maxLength={50}
                value={departmentShortName}
                onChange={(event) => setDepartmentShortName(event.target.value)}
                placeholder="Optional abbreviation"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Description
              <textarea
                rows={3}
                value={departmentDescription}
                onChange={(event) => setDepartmentDescription(event.target.value)}
                placeholder="Optional department description"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </label>

            <button
              type="submit"
              disabled={savingDepartment || schools.length === 0}
              className="w-full rounded-xl bg-[#102A43] px-5 py-3 font-semibold text-white hover:bg-[#243B53] disabled:opacity-50"
            >
              {savingDepartment ? "Saving..." : "Add Department"}
            </button>

            {schools.length === 0 && !loading && (
              <p className="text-sm text-amber-700">
                Create a school first before adding a department.
              </p>
            )}
          </div>
        </form>
      </div>

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
              School &amp; Department Records
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Records are loaded from the COELS database.
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
            Loading academic structure...
          </p>
        ) : schools.length === 0 ? (
          <p className="py-8 text-center text-slate-500">
            No schools found. Add a school above to get started.
          </p>
        ) : (
          <div className="space-y-5">
            {schools.map((school) => {
              const schoolDepartments = departments.filter(
                (department) => department.school_id === school.id,
              );

              const programmeName =
                school.programme?.name ||
                programmes.find((item) => item.id === school.programme_id)?.name ||
                `Programme ID ${school.programme_id}`;

              return (
                <article
                  key={school.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800">
                        {school.name}
                      </h3>

                      {school.short_name && (
                        <p className="text-sm text-slate-500">
                          Short name: {school.short_name}
                        </p>
                      )}

                      <p className="mt-1 text-sm text-slate-500">
                        Programme: {programmeName}
                      </p>

                      <span
                        className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          school.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {school.is_active ? "Active" : "Inactive"}
                      </span>

                      {school.description && (
                        <p className="mt-2 text-sm text-slate-600">
                          {school.description}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={updatingSchoolId === school.id}
                      onClick={() => void toggleSchool(school)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold disabled:opacity-50"
                    >
                      {updatingSchoolId === school.id
                        ? "Updating..."
                        : school.is_active
                          ? "Deactivate"
                          : "Activate"}
                    </button>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <h4 className="text-sm font-semibold text-[#102A43]">
                      Departments ({schoolDepartments.length})
                    </h4>

                    {schoolDepartments.length === 0 ? (
                      <p className="mt-2 text-sm text-slate-400">
                        No departments assigned to this school yet.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {schoolDepartments.map((department) => (
                          <div
                            key={department.id}
                            className="flex flex-col gap-3 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="font-medium text-slate-800">
                                {department.name}
                              </p>

                              {department.short_name && (
                                <p className="text-xs text-slate-500">
                                  Short name: {department.short_name}
                                </p>
                              )}

                              {department.description && (
                                <p className="mt-1 text-sm text-slate-500">
                                  {department.description}
                                </p>
                              )}

                              <span
                                className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                                  department.is_active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {department.is_active ? "Active" : "Inactive"}
                              </span>
                            </div>

                            <button
                              type="button"
                              disabled={updatingDepartmentId === department.id}
                              onClick={() => void toggleDepartment(department)}
                              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold disabled:opacity-50"
                            >
                              {updatingDepartmentId === department.id
                                ? "Updating..."
                                : department.is_active
                                  ? "Deactivate"
                                  : "Activate"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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