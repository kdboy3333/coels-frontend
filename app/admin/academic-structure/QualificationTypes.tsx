"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiUrl, authHeaders, getAuthToken } from "../../../lib/api";

type QualificationType = {
  id: number;
  name: string;
  short_name: string | null;
  description: string | null;
  is_active: boolean | number;
  programmes_count?: number;
};

type ApiResponse = {
  message?: string;
  qualification_types?: QualificationType[];
  qualification_type?: QualificationType;
  errors?: Record<string, string[]>;
};

async function readResponse(response: Response): Promise<ApiResponse> {
  try {
    return (await response.json()) as ApiResponse;
  } catch {
    return {};
  }
}

function errorMessage(data: ApiResponse, fallback: string): string {
  const validationErrors = data.errors
    ? Object.values(data.errors).flat().join(" ")
    : "";

  return validationErrors || data.message || fallback;
}

export default function QualificationTypes() {
  const [records, setRecords] = useState<QualificationType[]>([]);
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingActive, setEditingActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const headers = useCallback(
    () => authHeaders({ "Content-Type": "application/json" }),
    [],
  );

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(apiUrl("admin/qualification-types"), {
        headers: headers(),
        cache: "no-store",
      });
      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Please sign in again."
            : response.status === 403
              ? "Only an authorised Super Admin can manage qualification types."
              : errorMessage(data, "Unable to load qualification types."),
        );
      }

      setRecords(data.qualification_types ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not connect to the COELS backend.",
      );
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  function resetForm() {
    setName("");
    setShortName("");
    setDescription("");
    setEditingId(null);
    setEditingActive(true);
  }

  function startEditing(record: QualificationType) {
    setEditingId(record.id);
    setName(record.name);
    setShortName(record.short_name ?? "");
    setDescription(record.description ?? "");
    setEditingActive(Boolean(record.is_active));
    setMessage("");
    setError("");
  }

  async function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!getAuthToken()) {
      setError("Please sign in before managing qualification types.");
      return;
    }

    if (!name.trim()) {
      setError("Qualification name is required.");
      return;
    }

    setSaving(true);

    try {
      const editing = editingId !== null;
      const response = await fetch(
        apiUrl(
          editing
            ? `admin/qualification-types/${editingId}`
            : "admin/qualification-types",
        ),
        {
          method: editing ? "PUT" : "POST",
          headers: headers(),
          body: JSON.stringify({
            name: name.trim(),
            short_name: shortName.trim() || null,
            description: description.trim() || null,
            ...(editing ? { is_active: editingActive } : { is_active: true }),
          }),
        },
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Your session has expired. Please sign in again."
            : response.status === 403
              ? "Access denied. Super Admin permission is required."
              : errorMessage(data, "Could not save qualification type."),
        );
      }

      setMessage(
        editing
          ? "Qualification type updated successfully."
          : "Qualification type created successfully.",
      );
      resetForm();
      await loadRecords();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save qualification type.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(record: QualificationType) {
    setMessage("");
    setError("");

    if (!getAuthToken()) {
      setError("Please sign in before updating qualification types.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        apiUrl(`admin/qualification-types/${record.id}`),
        {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify({
            name: record.name,
            short_name: record.short_name,
            description: record.description,
            is_active: !Boolean(record.is_active),
          }),
        },
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Your session has expired. Please sign in again."
            : response.status === 403
              ? "Access denied. Super Admin permission is required."
              : errorMessage(data, "Could not update qualification type."),
        );
      }

      setMessage(
        `Qualification type "${record.name}" updated successfully.`,
      );
      await loadRecords();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not update qualification type.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-[#102A43]">
          Qualification Types
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Manage NCE, ND, B.Sc. and other qualification categories here.
          Existing records are preserved when a type is deactivated.
        </p>
      </div>

      <form onSubmit={saveRecord} className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Qualification name *
          <input
            required
            maxLength={255}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Bachelor of Science"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Short name
          <input
            maxLength={50}
            value={shortName}
            onChange={(event) => setShortName(event.target.value)}
            placeholder="e.g. B.Sc."
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          />
        </label>

        <label className="text-sm font-medium text-slate-700 md:col-span-2">
          Description
          <textarea
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional description"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
          />
        </label>

        {editingId !== null && (
          <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
            <input
              type="checkbox"
              checked={editingActive}
              onChange={(event) => setEditingActive(event.target.checked)}
            />
            Active
          </label>
        )}

        <div className="flex flex-wrap gap-3 md:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#102A43] px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editingId !== null
                ? "Save Changes"
                : "Add Qualification Type"}
          </button>

          {editingId !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-300 px-5 py-3 font-semibold"
            >
              Cancel Edit
            </button>
          )}

          <button
            type="button"
            onClick={() => void loadRecords()}
            disabled={loading}
            className="rounded-xl border border-slate-300 px-5 py-3 font-semibold disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </form>

      {message && (
        <p role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-800">
          {message}
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-6 text-center text-slate-500">
          Loading qualification types...
        </p>
      ) : records.length === 0 ? (
        <p className="rounded-xl bg-slate-50 p-4 text-slate-600">
          No qualification types were returned by the API.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3">Qualification</th>
                <th className="px-4 py-3">Short name</th>
                <th className="px-4 py-3">Programmes</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b border-slate-100">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-800">{record.name}</p>
                    {record.description && (
                      <p className="mt-1 text-xs text-slate-500">
                        {record.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4">{record.short_name || "—"}</td>
                  <td className="px-4 py-4">{record.programmes_count ?? "—"}</td>
                  <td className="px-4 py-4">
                    {Boolean(record.is_active) ? "Active" : "Inactive"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(record)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void toggleStatus(record)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold disabled:opacity-50"
                      >
                        {Boolean(record.is_active) ? "Deactivate" : "Activate"}
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
  );
}