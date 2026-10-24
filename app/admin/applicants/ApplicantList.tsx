"use client";

import { useCallback, useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

type RelatedRecord = {
  name?: string;
  title?: string;
  programme_name?: string;
  programme_type?: string;
  school_name?: string;
  department_name?: string;
};

type AdmissionApplication = {
  id: number;
  application_number: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email: string;
  phone?: string | null;
  academic_session?: string | null;
  status: string;
  decision_note?: string | null;
  programme?: RelatedRecord | null;
  school?: RelatedRecord | null;
  department?: RelatedRecord | null;
};

type ApiResponse = {
  data?: AdmissionApplication[];
  message?: string;
};

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function getToken(): string | null {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("coels_token") ||
    localStorage.getItem("token")
  );
}

function getRelatedName(
  record?: RelatedRecord | null,
  fallback = "Not assigned"
): string {
  if (!record) return fallback;

  return (
    record.name ||
    record.title ||
    record.programme_name ||
    record.programme_type ||
    record.school_name ||
    record.department_name ||
    fallback
  );
}

function formatStatus(status: string): string {
  return (
    statusOptions.find((option) => option.value === status)?.label ||
    status.replaceAll("_", " ")
  );
}

export default function ApplicantList() {
  const [applications, setApplications] = useState<
    AdmissionApplication[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    const token = getToken();

    if (!token) {
      setError(
        "Your login session was not found. Sign out and log in again as Super Admin."
      );
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/admin/admission-applications`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const payload = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(
          payload.message ||
            `Unable to load applications (HTTP ${response.status}).`
        );
      }

      setApplications(Array.isArray(payload.data) ? payload.data : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while loading applications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchApplications();
  }, [fetchApplications]);

  function updateApplication(
    id: number,
    changes: Partial<AdmissionApplication>
  ) {
    setApplications((current) =>
      current.map((application) =>
        application.id === id
          ? { ...application, ...changes }
          : application
      )
    );
  }

  async function saveDecision(application: AdmissionApplication) {
    const token = getToken();

    if (!token) {
      setError("Your login session has expired. Please log in again.");
      return;
    }

    setSavingId(application.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/admin/admission-applications/${application.id}/decision`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: application.status,
            decision_note: application.decision_note || null,
          }),
        }
      );

      const payload = (await response.json()) as {
        message?: string;
        application?: AdmissionApplication;
        errors?: Record<string, string[]>;
      };

      if (!response.ok) {
        const validationMessage = payload.errors
          ? Object.values(payload.errors).flat().join(" ")
          : "";

        throw new Error(
          validationMessage ||
            payload.message ||
            `Could not save the decision (HTTP ${response.status}).`
        );
      }

      if (payload.application) {
        updateApplication(application.id, payload.application);
      }

      setNotice(
        payload.message || "Admission decision saved successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while saving the decision."
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Applicant Records
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Review applications and save admission decisions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchApplications()}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
        >
          {notice}
        </div>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">
          Loading applications from the database...
        </p>
      ) : applications.length === 0 && !error ? (
        <div className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center">
          <h3 className="font-semibold text-slate-800">
            No applications found
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Applications will appear here when records exist in the
            admissions database.
          </p>
        </div>
      ) : applications.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                <th className="px-3 py-3 font-semibold">Application No.</th>
                <th className="px-3 py-3 font-semibold">Applicant</th>
                <th className="px-3 py-3 font-semibold">Contact</th>
                <th className="px-3 py-3 font-semibold">Programme</th>
                <th className="px-3 py-3 font-semibold">Session</th>
                <th className="px-3 py-3 font-semibold">Decision</th>
                <th className="px-3 py-3 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {applications.map((application) => (
                <tr
                  key={application.id}
                  className="border-b border-slate-100 align-top hover:bg-slate-50"
                >
                  <td className="px-3 py-4 font-medium text-slate-800">
                    {application.application_number}
                  </td>

                  <td className="px-3 py-4">
                    <div className="font-semibold text-slate-900">
                      {[
                        application.first_name,
                        application.middle_name,
                        application.last_name,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {getRelatedName(
                        application.department,
                        "Department not assigned"
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-4 text-slate-600">
                    <div>{application.email}</div>
                    {application.phone && (
                      <div className="mt-1">{application.phone}</div>
                    )}
                  </td>

                  <td className="px-3 py-4 text-slate-700">
                    <div>
                      {getRelatedName(
                        application.programme,
                        "Programme not assigned"
                      )}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {getRelatedName(
                        application.school,
                        "School not assigned"
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-4 text-slate-700">
                    {application.academic_session || "—"}
                  </td>

                  <td className="px-3 py-4">
                    <label
                      className="sr-only"
                      htmlFor={`status-${application.id}`}
                    >
                      Decision for {application.application_number}
                    </label>
                    <select
                      id={`status-${application.id}`}
                      value={application.status}
                      onChange={(event) =>
                        updateApplication(application.id, {
                          status: event.target.value,
                        })
                      }
                      className="w-36 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <label
                      className="sr-only"
                      htmlFor={`note-${application.id}`}
                    >
                      Decision note for {application.application_number}
                    </label>
                    <textarea
                      id={`note-${application.id}`}
                      value={application.decision_note || ""}
                      onChange={(event) =>
                        updateApplication(application.id, {
                          decision_note: event.target.value,
                        })
                      }
                      rows={2}
                      maxLength={5000}
                      placeholder="Optional decision note"
                      className="mt-2 w-48 rounded-lg border border-slate-300 px-2 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <div className="mt-1 text-xs text-slate-500">
                      Current: {formatStatus(application.status)}
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <button
                      type="button"
                      onClick={() => void saveDecision(application)}
                      disabled={savingId !== null}
                      className="rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingId === application.id
                        ? "Saving..."
                        : "Save Decision"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && applications.length > 0 && (
        <p className="mt-4 text-xs text-slate-500">
          Showing {applications.length} application
          {applications.length === 1 ? "" : "s"} on this page.
        </p>
      )}
    </section>
  );
}