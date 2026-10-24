"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API = "http://127.0.0.1:8000/api";

type Programme = { id: number; name: string; short_name?: string | null };
type School = { id: number; name: string; programme_id?: number | null; short_name?: string | null };
type Department = { id: number; name: string; school_id: number; short_name?: string | null };

type Student = {
  id: number;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  admission_number?: string | null;
  registration_number?: string | null;
  current_level: string;
  current_semester?: string;
  status: string;
  department?: Department | null;
  school?: School | null;
  user?: {
    username?: string;
    email?: string;
    must_change_password?: boolean;
  } | null;
};

type Application = {
  id: number;
  application_number: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email: string;
  phone?: string | null;
  programme_id?: number | null;
  school_id?: number | null;
  department_id?: number | null;
  academic_session?: string | null;
  status: string;
  decision_note?: string | null;
  programme?: Programme | null;
  school?: School | null;
  department?: Department | null;
};

type Form = {
  name: string;
  email: string;
  programme_id: string;
  school_id: string;
  department_id: string;
  admission_number: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  phone: string;
  registration_year: string;
  academic_session: string;
  current_level: string;
  current_semester: string;
};

type ApplicationSettings = {
  registration_year: string;
  academic_session: string;
  current_level: string;
  current_semester: string;
};

const year = new Date().getFullYear();

const blankForm = (): Form => ({
  name: "",
  email: "",
  programme_id: "",
  school_id: "",
  department_id: "",
  admission_number: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  phone: "",
  registration_year: String(year),
  academic_session: `${year}/${year + 1}`,
  current_level: "",
  current_semester: "",
});

async function request(url: string, token: string, options: RequestInit = {}) {
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
    const errors = data?.errors ? Object.values(data.errors).flat() : [];
    throw new Error(
      String(errors[0] || data?.message || `Request failed (${response.status}).`)
    );
  }

  return data;
}

function records<T>(response: any): T[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.students)) return response.students;
  if (Array.isArray(response?.applications)) return response.applications;
  if (Array.isArray(response?.programmes)) return response.programmes;
  if (Array.isArray(response?.schools)) return response.schools;
  if (Array.isArray(response?.departments)) return response.departments;
  return [];
}

export default function StaffStudentsPage() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [form, setForm] = useState<Form>(blankForm());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingApplication, setCreatingApplication] = useState<number | null>(null);
  const [applicationSettings, setApplicationSettings] = useState<
    Record<number, ApplicationSettings>
  >({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getToken = useCallback(
    () =>
      typeof window === "undefined"
        ? ""
        : localStorage.getItem("token") ||
          localStorage.getItem("coels_token") ||
          "",
    []
  );

  const loadData = useCallback(async (authToken: string) => {
    setLoading(true);
    setError("");

    try {
      const [p, s, d, st] = await Promise.all([
        request(`${API}/programmes`, authToken),
        request(`${API}/schools`, authToken),
        request(`${API}/departments`, authToken),
        request(`${API}/hod/students`, authToken),
      ]);

      setProgrammes(records<Programme>(p));
      setSchools(records<School>(s));
      setDepartments(records<Department>(d));
      setStudents(records<Student>(st));

      try {
        const admissionResponse = await request(
          `${API}/hod/admission-applications`,
          authToken
        );

        const list = records<Application>(admissionResponse);
        setApplications(list);

        setApplicationSettings((previous) => {
          const next = { ...previous };

          for (const application of list) {
            if (!next[application.id]) {
              next[application.id] = {
                registration_year: String(year),
                academic_session:
                  application.academic_session || `${year}/${year + 1}`,
                current_level: "",
                current_semester: "First Semester",
              };
            }
          }

          return next;
        });
      } catch {
        setApplications([]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load student management data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const authToken = getToken();

    if (!authToken) {
      router.push("/portal");
      return;
    }

    setToken(authToken);
    void loadData(authToken);
  }, [getToken, loadData, router]);

  const selectedProgramme = programmes.find(
    (item) => String(item.id) === form.programme_id
  );

  const filteredSchools = useMemo(
    () =>
      schools.filter(
        (school) =>
          !form.programme_id ||
          school.programme_id == null ||
          String(school.programme_id) === form.programme_id
      ),
    [schools, form.programme_id]
  );

  const filteredDepartments = useMemo(
    () =>
      departments.filter(
        (department) =>
          form.school_id && String(department.school_id) === form.school_id
      ),
    [departments, form.school_id]
  );

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;

    return students.filter((student) =>
      [
        student.first_name,
        student.middle_name,
        student.last_name,
        student.admission_number,
        student.registration_number,
        student.user?.username,
        student.user?.email,
        student.department?.name,
        student.school?.name,
      ].some((value) => String(value || "").toLowerCase().includes(q))
    );
  }, [students, search]);

  const updateForm = (field: keyof Form, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const updateApplicationSetting = (
    id: number,
    field:
      | "registration_year"
      | "academic_session"
      | "current_level"
      | "current_semester",
    value: string
  ) => {
    setApplicationSettings((previous) => ({
      ...previous,
      [id]: {
        ...previous[id],
        registration_year: previous[id]?.registration_year ?? String(year),
        academic_session:
          previous[id]?.academic_session ?? `${year}/${year + 1}`,
        current_level: previous[id]?.current_level ?? "",
        current_semester:
          previous[id]?.current_semester ?? "First Semester",
        [field]: value,
      },
    }));
  };

  const createFromApplication = async (application: Application) => {
    setError("");
    setSuccess("");

    if (application.status !== "approved") {
      setError(
        "Only approved admission applications can be used to create student accounts."
      );
      return;
    }

    const settings = applicationSettings[application.id];

    if (!settings?.current_level.trim() || !settings?.current_semester) {
      setError(
        `Choose the level and semester for ${application.application_number} first.`
      );
      return;
    }

    setCreatingApplication(application.id);

    try {
      const response = await request(
        `${API}/hod/admission-applications/${application.id}/create-student`,
        token,
        {
          method: "POST",
          body: JSON.stringify(settings),
        }
      );

      setSuccess(
        response.message ||
          `Student account created for ${application.first_name} ${application.last_name}. Temporary credentials should be sent by email.`
      );

      setApplications((previous) =>
        previous.filter((item) => item.id !== application.id)
      );

      await loadData(token);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create the student account."
      );
    } finally {
      setCreatingApplication(null);
    }
  };

  const createManualStudent = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.programme_id || !form.school_id || !form.department_id) {
      setError("Select the programme, school, and department.");
      return;
    }

    setSaving(true);

    try {
      const response = await request(`${API}/hod/students`, token, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          programme_id: Number(form.programme_id),
          school_id: Number(form.school_id),
          department_id: Number(form.department_id),
          admission_number: form.admission_number.trim() || null,
          middle_name: form.middle_name.trim() || null,
          phone: form.phone.trim() || null,
        }),
      });

      setSuccess(
        response.message ||
          "Student account created. Temporary credentials should be sent by email."
      );

      setForm(blankForm());
      await loadData(token);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create student account."
      );
    } finally {
      setSaving(false);
    }
  };

  const approvedApplications = applications.filter(
    (item) => item.status === "approved"
  );

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#C9A227]">
              HOD Portal
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-[#102A43]">
              Student Management
            </h1>
            <p className="mt-2 text-slate-600">
              Create student accounts from approved admissions or through
              manual entry.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/staff")}
            className="rounded-lg bg-[#102A43] px-5 py-3 text-sm font-bold text-white hover:bg-[#163b5c]"
          >
            Back to Staff Dashboard
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700"
          >
            {success}
          </div>
        )}

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-2xl font-extrabold text-[#102A43]">
              Approved Admission Applications
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Create a student account after an application has been approved.
              The registration number is generated after the required
              school-fee payment is confirmed.
            </p>
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Loading applications...
            </p>
          ) : approvedApplications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="font-bold text-slate-700">
                No approved applications available.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Approved applications will appear here when the HOD
                applications endpoint is available.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {approvedApplications.map((application) => {
                const settings = applicationSettings[application.id] || {
                  registration_year: String(year),
                  academic_session:
                    application.academic_session || `${year}/${year + 1}`,
                  current_level: "",
                  current_semester: "First Semester",
                };

                return (
                  <article
                    key={application.id}
                    className="rounded-xl border border-slate-200 p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-[#C9A227]">
                          {application.application_number}
                        </p>
                        <h3 className="mt-1 text-lg font-extrabold text-[#102A43]">
                          {application.first_name}{" "}
                          {application.middle_name
                            ? `${application.middle_name} `
                            : ""}
                          {application.last_name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {application.email}
                          {application.phone ? ` Â· ${application.phone}` : ""}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {application.programme?.name ||
                            programmes.find(
                              (item) => item.id === application.programme_id
                            )?.name ||
                            "Programme not specified"}
                          {" Â· "}
                          {application.school?.name ||
                            schools.find(
                              (item) => item.id === application.school_id
                            )?.name ||
                            "School not specified"}
                          {" Â· "}
                          {application.department?.name ||
                            departments.find(
                              (item) => item.id === application.department_id
                            )?.name ||
                            "Department not specified"}
                        </p>
                      </div>

                      <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        Approved
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <label className="text-sm font-bold text-slate-700">
                        Registration Year
                        <input
                          value={settings.registration_year}
                          onChange={(e) =>
                            updateApplicationSetting(
                              application.id,
                              "registration_year",
                              e.target.value
                            )
                          }
                          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
                        />
                      </label>

                      <label className="text-sm font-bold text-slate-700">
                        Academic Session
                        <input
                          value={settings.academic_session}
                          onChange={(e) =>
                            updateApplicationSetting(
                              application.id,
                              "academic_session",
                              e.target.value
                            )
                          }
                          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
                        />
                      </label>

                      <label className="text-sm font-bold text-slate-700">
                        Current Level
                        <input
                          value={settings.current_level}
                          onChange={(e) =>
                            updateApplicationSetting(
                              application.id,
                              "current_level",
                              e.target.value
                            )
                          }
                          placeholder="e.g. NCE 1"
                          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
                        />
                      </label>

                      <label className="text-sm font-bold text-slate-700">
                        Current Semester
                        <select
                          value={settings.current_semester}
                          onChange={(e) =>
                            updateApplicationSetting(
                              application.id,
                              "current_semester",
                              e.target.value
                            )
                          }
                          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal"
                        >
                          <option value="First Semester">First Semester</option>
                          <option value="Second Semester">
                            Second Semester
                          </option>
                        </select>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => void createFromApplication(application)}
                      disabled={creatingApplication === application.id}
                      className="mt-5 rounded-lg bg-[#102A43] px-5 py-3 text-sm font-bold text-white hover:bg-[#163b5c] disabled:opacity-60"
                    >
                      {creatingApplication === application.id
                        ? "Creating Account..."
                        : "Create Student Account"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-extrabold text-[#102A43]">
            Manual Student Account Creation
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Use this form when a student account needs to be created manually.
          </p>

          <form
            onSubmit={createManualStudent}
            className="mt-6 grid gap-5 md:grid-cols-3"
          >
            <label className="text-sm font-bold text-slate-700">
              Programme
              <select
                required
                value={form.programme_id}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    programme_id: e.target.value,
                    school_id: "",
                    department_id: "",
                  }))
                }
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal"
              >
                <option value="">Select programme</option>
                {programmes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                    {item.short_name ? ` (${item.short_name})` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-bold text-slate-700">
              School
              <select
                required
                disabled={!form.programme_id}
                value={form.school_id}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    school_id: e.target.value,
                    department_id: "",
                  }))
                }
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal disabled:bg-slate-100"
              >
                <option value="">Select school</option>
                {filteredSchools.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-bold text-slate-700">
              Department
              <select
                required
                disabled={!form.school_id}
                value={form.department_id}
                onChange={(e) => updateForm("department_id", e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal disabled:bg-slate-100"
              >
                <option value="">Select department</option>
                {filteredDepartments.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-bold text-slate-700">
              First Name
              <input
                required
                value={form.first_name}
                onChange={(e) => updateForm("first_name", e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
              />
            </label>

            <label className="text-sm font-bold text-slate-700">
              Middle Name
              <input
                value={form.middle_name}
                onChange={(e) => updateForm("middle_name", e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
              />
            </label>

            <label className="text-sm font-bold text-slate-700">
              Last Name
              <input
                required
                value={form.last_name}
                onChange={(e) => updateForm("last_name", e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
              />
            </label>

            <label className="text-sm font-bold text-slate-700">
              Account Name
              <input
                required
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                placeholder="Full name for login account"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
              />
            </label>

            <label className="text-sm font-bold text-slate-700">
              Email Address
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => updateForm("email", e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
              />
            </label>

            <label className="text-sm font-bold text-slate-700">
              Phone
              <input
                value={form.phone}
                onChange={(e) => updateForm("phone", e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
              />
            </label>

            <label className="text-sm font-bold text-slate-700">
              Admission Number
              <input
                value={form.admission_number}
                onChange={(e) => updateForm("admission_number", e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
              />
            </label>

            <label className="text-sm font-bold text-slate-700">
              Registration Year
              <input
                required
                value={form.registration_year}
                onChange={(e) =>
                  updateForm("registration_year", e.target.value)
                }
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
              />
            </label>

            <label className="text-sm font-bold text-slate-700">
              Academic Session
              <input
                required
                value={form.academic_session}
                onChange={(e) => updateForm("academic_session", e.target.value)}
                placeholder="2026/2027"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
              />
            </label>

            <label className="text-sm font-bold text-slate-700">
              Current Level
              <input
                required
                value={form.current_level}
                onChange={(e) => updateForm("current_level", e.target.value)}
                placeholder="e.g. NCE 1"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal"
              />
            </label>

            <label className="text-sm font-bold text-slate-700">
              Current Semester
              <select
                required
                value={form.current_semester}
                onChange={(e) =>
                  updateForm("current_semester", e.target.value)
                }
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal"
              >
                <option value="">Select semester</option>
                <option value="First Semester">First Semester</option>
                <option value="Second Semester">Second Semester</option>
              </select>
            </label>

            <div className="flex flex-wrap gap-3 md:col-span-3">
              <button
                disabled={saving}
                type="submit"
                className="rounded-lg bg-[#102A43] px-6 py-3 text-sm font-bold text-white hover:bg-[#163b5c] disabled:opacity-60"
              >
                {saving ? "Creating Student..." : "Create Student Account"}
              </button>

              <button
                type="button"
                onClick={() => setForm(blankForm())}
                className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Clear Form
              </button>
            </div>

            {selectedProgramme && (
              <p className="text-xs text-slate-500 md:col-span-3">
                Selected programme: {selectedProgramme.name}
              </p>
            )}
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-[#102A43]">
                Student Accounts
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Search students and check their account and registration
                status.
              </p>
            </div>

            <span className="w-fit rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
              {filteredStudents.length} student(s)
            </span>
          </div>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, username, email, admission number or department..."
            className="mt-5 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#102A43]"
          />

          {loading ? (
            <p className="py-10 text-center text-sm text-slate-500">
              Loading students...
            </p>
          ) : filteredStudents.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              No students found.
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    {[
                      "Student",
                      "Username",
                      "Admission No.",
                      "Registration No.",
                      "Department",
                      "Level",
                      "Status",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-4 py-4">
                        <p className="text-sm font-bold text-[#102A43]">
                          {student.first_name}{" "}
                          {student.middle_name
                            ? `${student.middle_name} `
                            : ""}
                          {student.last_name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {student.user?.email || "â€”"}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm font-bold text-slate-700">
                        {student.user?.username || "â€”"}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {student.admission_number || "â€”"}
                      </td>

                      <td className="px-4 py-4 text-sm font-bold text-[#102A43]">
                        {student.registration_number || "Not generated"}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-700">
                        {student.department?.name || "â€”"}
                        <p className="mt-1 text-xs text-slate-500">
                          {student.school?.name || ""}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {student.current_level || "â€”"}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            student.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {student.status}
                        </span>

                        {student.user?.must_change_password && (
                          <p className="mt-2 text-xs font-bold text-amber-700">
                            Password change required
                          </p>
                        )}
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
