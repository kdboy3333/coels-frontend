"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import ApplicantList from "./ApplicantList";
import AdmissionActions from "./AdmissionActions";
import ApplicantNotice from "./ApplicantNotice";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

type AcademicOption = {
  id: number;
  name?: string;
  title?: string;
  programme_name?: string;
  programme_type?: string;
  school_name?: string;
  department_name?: string;
  programme_id?: number | null;
  school_id?: number | null;
};

type ApplicationForm = {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone: string;
  academic_session: string;
  programme_id: string;
  school_id: string;
  department_id: string;
};

const emptyForm: ApplicationForm = {
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  phone: "",
  academic_session: "",
  programme_id: "",
  school_id: "",
  department_id: "",
};

function getToken(): string | null {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("coels_token") ||
    localStorage.getItem("token")
  );
}

function getList(payload: unknown): AcademicOption[] {
  if (Array.isArray(payload)) return payload as AcademicOption[];

  if (payload && typeof payload === "object") {
    const record = payload as {
      data?: unknown;
      programmes?: unknown;
      schools?: unknown;
      departments?: unknown;
    };

    if (Array.isArray(record.data)) {
      return record.data as AcademicOption[];
    }

    if (Array.isArray(record.programmes)) {
      return record.programmes as AcademicOption[];
    }

    if (Array.isArray(record.schools)) {
      return record.schools as AcademicOption[];
    }

    if (Array.isArray(record.departments)) {
      return record.departments as AcademicOption[];
    }
  }

  return [];
}

function optionName(option: AcademicOption): string {
  return (
    option.name ||
    option.title ||
    option.programme_name ||
    option.programme_type ||
    option.school_name ||
    option.department_name ||
    `Record ${option.id}`
  );
}

export default function ApplicantsPage() {
  const [form, setForm] = useState<ApplicationForm>(emptyForm);
  const [programmes, setProgrammes] = useState<AcademicOption[]>([]);
  const [schools, setSchools] = useState<AcademicOption[]>([]);
  const [departments, setDepartments] = useState<AcademicOption[]>([]);
  const [loadingStructure, setLoadingStructure] = useState(true);
  const [structureError, setStructureError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAcademicStructure = useCallback(async () => {
    setLoadingStructure(true);
    setStructureError("");

    const token = getToken();

    if (!token) {
      setStructureError(
        "Please sign in as Super Admin to load academic programmes, schools, and departments."
      );
      setLoadingStructure(false);
      return;
    }

    try {
      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [programmeResponse, schoolResponse, departmentResponse] =
        await Promise.all([
          fetch(`${API_URL}/programmes`, { headers, cache: "no-store" }),
          fetch(`${API_URL}/schools`, { headers, cache: "no-store" }),
          fetch(`${API_URL}/departments`, { headers, cache: "no-store" }),
        ]);

      if (
        !programmeResponse.ok ||
        !schoolResponse.ok ||
        !departmentResponse.ok
      ) {
        throw new Error(
          "The academic structure could not be loaded. Confirm that your Super Admin session is active."
        );
      }

      const [programmePayload, schoolPayload, departmentPayload] =
        await Promise.all([
          programmeResponse.json(),
          schoolResponse.json(),
          departmentResponse.json(),
        ]);

      setProgrammes(getList(programmePayload));
      setSchools(getList(schoolPayload));
      setDepartments(getList(departmentPayload));
    } catch (loadError) {
      setStructureError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load academic structure."
      );
    } finally {
      setLoadingStructure(false);
    }
  }, []);

  useEffect(() => {
    void loadAcademicStructure();
  }, [loadAcademicStructure]);

  const availableSchools = schools.filter(
    (school) =>
      !form.programme_id ||
      school.programme_id == null ||
      String(school.programme_id) === form.programme_id
  );

  const availableDepartments = departments.filter(
    (department) =>
      !form.school_id ||
      department.school_id == null ||
      String(department.school_id) === form.school_id
  );

  function updateField(
    field: keyof ApplicationForm,
    value: string
  ) {
    setForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "programme_id") {
        next.school_id = "";
        next.department_id = "";
      } else if (field === "school_id") {
        next.department_id = "";
      }

      return next;
    });
  }

  async function submitApplication(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/admission-applications`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          middle_name: form.middle_name.trim() || null,
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          academic_session: form.academic_session.trim() || null,
          programme_id: form.programme_id
            ? Number(form.programme_id)
            : null,
          school_id: form.school_id ? Number(form.school_id) : null,
          department_id: form.department_id
            ? Number(form.department_id)
            : null,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        const validationErrors = payload.errors
          ? Object.values(payload.errors).flat().join(" ")
          : "";

        throw new Error(
          validationErrors ||
            payload.message ||
            `Application submission failed (HTTP ${response.status}).`
        );
      }

      const applicationNumber = payload.application?.application_number;

      setSuccess(
        applicationNumber
          ? `Application submitted successfully. Application number: ${applicationNumber}`
          : payload.message || "Application submitted successfully."
      );

      setForm(emptyForm);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to submit your application. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Administration"
            title="Applicants & Admissions"
            description="Submit applications, review applicant records, and manage admission decisions."
          />
        </section>

        <section className="mx-auto max-w-7xl space-y-10 px-5 py-12 sm:py-16">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#102A43]">
                  New Application
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Enter applicant details and select the intended
                  programme, school, and department.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadAcademicStructure()}
                disabled={loadingStructure}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {loadingStructure ? "Loading..." : "Refresh Structure"}
              </button>
            </div>

            {structureError && (
              <div
                role="alert"
                className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-800"
              >
                {structureError}
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-800"
              >
                {success}
              </div>
            )}

            <form
              onSubmit={submitApplication}
              className="mt-6 grid gap-5 sm:grid-cols-2"
            >
              <div>
                <label htmlFor="first_name" className="mb-2 block text-sm font-semibold text-slate-700">
                  First name *
                </label>
                <input
                  id="first_name"
                  required
                  maxLength={100}
                  value={form.first_name}
                  onChange={(event) => updateField("first_name", event.target.value)}
                  autoComplete="given-name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-3"
                />
              </div>

              <div>
                <label htmlFor="middle_name" className="mb-2 block text-sm font-semibold text-slate-700">
                  Middle name
                </label>
                <input
                  id="middle_name"
                  maxLength={100}
                  value={form.middle_name}
                  onChange={(event) => updateField("middle_name", event.target.value)}
                  autoComplete="additional-name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-3"
                />
              </div>

              <div>
                <label htmlFor="last_name" className="mb-2 block text-sm font-semibold text-slate-700">
                  Last name *
                </label>
                <input
                  id="last_name"
                  required
                  maxLength={100}
                  value={form.last_name}
                  onChange={(event) => updateField("last_name", event.target.value)}
                  autoComplete="family-name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-3"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                  Email address *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  maxLength={255}
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  autoComplete="email"
                  className="w-full rounded-lg border border-slate-300 px-3 py-3"
                />
              </div>

              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-slate-700">
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  maxLength={30}
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  autoComplete="tel"
                  className="w-full rounded-lg border border-slate-300 px-3 py-3"
                />
              </div>

              <div>
                <label htmlFor="academic_session" className="mb-2 block text-sm font-semibold text-slate-700">
                  Academic session
                </label>
                <input
                  id="academic_session"
                  maxLength={20}
                  placeholder="e.g. 2026/2027"
                  value={form.academic_session}
                  onChange={(event) => updateField("academic_session", event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-3"
                />
              </div>

              <div>
                <label htmlFor="programme_id" className="mb-2 block text-sm font-semibold text-slate-700">
                  Programme
                </label>
                <select
                  id="programme_id"
                  value={form.programme_id}
                  onChange={(event) => updateField("programme_id", event.target.value)}
                  disabled={loadingStructure}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 disabled:bg-slate-100"
                >
                  <option value="">Select programme</option>
                  {programmes.map((programme) => (
                    <option key={programme.id} value={programme.id}>
                      {optionName(programme)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="school_id" className="mb-2 block text-sm font-semibold text-slate-700">
                  School
                </label>
                <select
                  id="school_id"
                  value={form.school_id}
                  onChange={(event) => updateField("school_id", event.target.value)}
                  disabled={loadingStructure || availableSchools.length === 0}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 disabled:bg-slate-100"
                >
                  <option value="">Select school</option>
                  {availableSchools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {optionName(school)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="department_id" className="mb-2 block text-sm font-semibold text-slate-700">
                  Department
                </label>
                <select
                  id="department_id"
                  value={form.department_id}
                  onChange={(event) => updateField("department_id", event.target.value)}
                  disabled={loadingStructure || availableDepartments.length === 0}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 disabled:bg-slate-100"
                >
                  <option value="">Select department</option>
                  {availableDepartments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {optionName(department)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end sm:col-span-2">
                <button
                  type="submit"
                  disabled={submitting || loadingStructure}
                  className="rounded-lg bg-[#102A43] px-6 py-3 font-semibold text-white transition hover:bg-[#243B53] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </section>

          <div className="grid gap-8 lg:grid-cols-3">
            <div id="applicant-records" className="scroll-mt-24 lg:col-span-2">
              <ApplicantList />
            </div>
            <div>
              <AdmissionActions />
            </div>
          </div>

          <ApplicantNotice />
        </section>
      </main>

      <Footer />
    </>
  );
}