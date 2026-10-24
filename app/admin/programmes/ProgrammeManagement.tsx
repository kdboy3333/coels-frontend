"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiUrl, authHeaders, getAuthToken } from "../../../lib/api";

type QualificationType = {
  id: number;
  name: string;
  short_name: string | null;
  description?: string | null;
  is_active: boolean | number;
};

type Programme = {
  id: number;
  name: string;
  short_name: string | null;
  description: string | null;
  is_active: boolean | number;
  qualification_type_id?: number | null;
  qualificationType?: QualificationType | null;
  qualification_type?: QualificationType | null;
};

type ApiResponse = {
  message?: string;
  data?: unknown;
  programmes?: Programme[];
  programme?: Programme;
  qualification_types?: QualificationType[];
  qualificationTypes?: QualificationType[];
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

function getProgrammes(data: ApiResponse): Programme[] {
  if (Array.isArray(data.programmes)) {
    return data.programmes;
  }

  if (Array.isArray(data.data)) {
    return data.data as Programme[];
  }

  if (data.data && typeof data.data === "object") {
    const nested = data.data as {
      data?: Programme[];
      programmes?: Programme[];
    };

    if (Array.isArray(nested.programmes)) {
      return nested.programmes;
    }

    if (Array.isArray(nested.data)) {
      return nested.data;
    }
  }

  return [];
}

function getQualificationTypes(data: ApiResponse): QualificationType[] {
  if (Array.isArray(data.qualification_types)) {
    return data.qualification_types;
  }

  if (Array.isArray(data.qualificationTypes)) {
    return data.qualificationTypes;
  }

  if (Array.isArray(data.data)) {
    return data.data as QualificationType[];
  }

  if (data.data && typeof data.data === "object") {
    const nested = data.data as {
      qualification_types?: QualificationType[];
      qualificationTypes?: QualificationType[];
      data?: QualificationType[];
    };

    if (Array.isArray(nested.qualification_types)) {
      return nested.qualification_types;
    }

    if (Array.isArray(nested.qualificationTypes)) {
      return nested.qualificationTypes;
    }

    if (Array.isArray(nested.data)) {
      return nested.data;
    }
  }

  return [];
}

function getErrorMessage(data: ApiResponse, fallback: string): string {
  const validationErrors = data.errors
    ? Object.values(data.errors).flat().join(" ")
    : "";

  return validationErrors || data.message || fallback;
}

function getRequestError(
  response: Response,
  data: ApiResponse,
  fallback: string,
): Error {
  if (response.status === 401) {
    return new Error("Your session has expired. Please sign in again.");
  }

  if (response.status === 403) {
    return new Error(
      "Access denied. Your account may not have permission to perform this action.",
    );
  }

  if (response.status === 419) {
    return new Error(
      "Your session could not be verified. Please sign in again.",
    );
  }

  return new Error(getErrorMessage(data, fallback));
}

function isActive(value: boolean | number | undefined): boolean {
  return value === true || value === 1;
}

function programmeQualificationId(programme: Programme): number | null {
  return (
    programme.qualification_type_id ??
    programme.qualificationType?.id ??
    programme.qualification_type?.id ??
    null
  );
}

function programmeQualificationName(programme: Programme): string {
  const qualification =
    programme.qualificationType ?? programme.qualification_type;

  if (!qualification) {
    return "Not assigned";
  }

  return qualification.short_name
    ? `${qualification.name} (${qualification.short_name})`
    : qualification.name;
}

export default function ProgrammeManagement() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [qualificationTypes, setQualificationTypes] = useState<
    QualificationType[]
  >([]);

  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [description, setDescription] = useState("");
  const [qualificationTypeId, setQualificationTypeId] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editShortName, setEditShortName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editQualificationTypeId, setEditQualificationTypeId] = useState("");
  const [editActive, setEditActive] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const requestHeaders = useCallback(
    () =>
      authHeaders({
        "Content-Type": "application/json",
      }),
    [],
  );

  const loadProgrammes = useCallback(async () => {
    const response = await fetch(apiUrl("programmes"), {
      method: "GET",
      headers: requestHeaders(),
      cache: "no-store",
    });

    const data = await readResponse(response);

    if (!response.ok) {
      throw getRequestError(response, data, "Failed to load programmes.");
    }

    setProgrammes(getProgrammes(data));
  }, [requestHeaders]);

  const loadQualificationTypes = useCallback(async () => {
    const response = await fetch(apiUrl("qualification-types"), {
      method: "GET",
      headers: requestHeaders(),
      cache: "no-store",
    });

    const data = await readResponse(response);

    if (!response.ok) {
      throw getRequestError(
        response,
        data,
        "Failed to load qualification types.",
      );
    }

    setQualificationTypes(
      getQualificationTypes(data).filter((item) => isActive(item.is_active)),
    );
  }, [requestHeaders]);

  const refreshRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([loadProgrammes(), loadQualificationTypes()]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load academic records from the COELS backend.",
      );
    } finally {
      setLoading(false);
    }
  }, [loadProgrammes, loadQualificationTypes]);

  useEffect(() => {
    void refreshRecords();
  }, [refreshRecords]);

  function resetEdit() {
    setEditingId(null);
    setEditName("");
    setEditShortName("");
    setEditDescription("");
    setEditQualificationTypeId("");
    setEditActive(true);
  }

  function startEditing(programme: Programme) {
    setEditingId(programme.id);
    setEditName(programme.name);
    setEditShortName(programme.short_name ?? "");
    setEditDescription(programme.description ?? "");

    const currentQualificationId = programmeQualificationId(programme);

    setEditQualificationTypeId(
      currentQualificationId === null ? "" : String(currentQualificationId),
    );

    setEditActive(isActive(programme.is_active));
    setMessage("");
    setError("");
  }

  async function addProgramme(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!getAuthToken()) {
      setError("Please sign in to COELS before adding a programme.");
      return;
    }

    if (!name.trim()) {
      setError("Programme name is required.");
      return;
    }

    if (!qualificationTypeId) {
      setError("Please select a qualification type for the new programme.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(apiUrl("programmes"), {
        method: "POST",
        headers: requestHeaders(),
        body: JSON.stringify({
          name: name.trim(),
          short_name: shortName.trim() || null,
          description: description.trim() || null,
          qualification_type_id: Number(qualificationTypeId),
          is_active: true,
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw getRequestError(response, data, "Failed to save programme.");
      }

      setName("");
      setShortName("");
      setDescription("");
      setQualificationTypeId("");
      setMessage("Programme created successfully.");

      await refreshRecords();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save programme.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveProgrammeEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (editingId === null) {
      return;
    }

    if (!getAuthToken()) {
      setError("Please sign in to COELS before editing a programme.");
      return;
    }

    if (!editName.trim()) {
      setError("Programme name is required.");
      return;
    }

    setUpdatingId(editingId);

    try {
      const response = await fetch(apiUrl(`programmes/${editingId}`), {
        method: "PUT",
        headers: requestHeaders(),
        body: JSON.stringify({
          name: editName.trim(),
          short_name: editShortName.trim() || null,
          description: editDescription.trim() || null,
          qualification_type_id: editQualificationTypeId
            ? Number(editQualificationTypeId)
            : null,
          is_active: editActive,
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw getRequestError(response, data, "Failed to update programme.");
      }

      setMessage("Programme updated successfully.");
      resetEdit();
      await refreshRecords();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update programme.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function toggleStatus(programme: Programme) {
    setMessage("");
    setError("");

    if (!getAuthToken()) {
      setError("Please sign in to COELS before updating a programme.");
      return;
    }

    setUpdatingId(programme.id);

    try {
      const response = await fetch(apiUrl(`programmes/${programme.id}`), {
        method: "PUT",
        headers: requestHeaders(),
        body: JSON.stringify({
          name: programme.name,
          short_name: programme.short_name,
          description: programme.description,
          qualification_type_id: programmeQualificationId(programme),
          is_active: !isActive(programme.is_active),
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw getRequestError(response, data, "Failed to update programme.");
      }

      setMessage(`Programme "${programme.name}" updated successfully.`);
      await refreshRecords();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update programme.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#102A43]">
          Add Programme
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Create a programme and assign it to a qualification type managed by
          the COELS Super Admin.
        </p>

        <form
          onSubmit={addProgramme}
          className="mt-6 grid gap-5 md:grid-cols-2"
        >
          <label className="block text-sm font-medium text-slate-700">
            Programme name *
            <input
              required
              maxLength={255}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. National Certificate in Education"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#C9A227]"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Short name
            <input
              maxLength={50}
              value={shortName}
              onChange={(event) => setShortName(event.target.value)}
              placeholder="e.g. NCE"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#C9A227]"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700 md:col-span-2">
            Qualification type *
            <select
              required
              value={qualificationTypeId}
              onChange={(event) => setQualificationTypeId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#C9A227]"
            >
              <option value="">Select qualification type</option>
              {qualificationTypes.map((qualification) => (
                <option key={qualification.id} value={qualification.id}>
                  {qualification.name}
                  {qualification.short_name
                    ? ` (${qualification.short_name})`
                    : ""}
                </option>
              ))}
            </select>

            {qualificationTypes.length === 0 && (
              <span className="mt-2 block text-xs text-amber-700">
                No active qualification types are available. Add or activate a
                type in Academic Structure first.
              </span>
            )}
          </label>

          <label className="block text-sm font-medium text-slate-700 md:col-span-2">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional programme description"
              rows={3}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#C9A227]"
            />
          </label>

          <button
            type="submit"
            disabled={saving || loading || qualificationTypes.length === 0}
            className="rounded-xl bg-[#102A43] px-5 py-3 font-semibold text-white hover:bg-[#243B53] disabled:opacity-50 md:col-span-2"
          >
            {saving ? "Saving..." : "Add Programme"}
          </button>
        </form>
      </section>

      {editingId !== null && (
        <section className="rounded-2xl border border-amber-300 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#102A43]">
            Edit Programme
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Update the selected programme. Changes are saved to the COELS
            database.
          </p>

          <form
            onSubmit={saveProgrammeEdit}
            className="mt-6 grid gap-5 md:grid-cols-2"
          >
            <label className="block text-sm font-medium text-slate-700">
              Programme name *
              <input
                required
                maxLength={255}
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Short name
              <input
                maxLength={50}
                value={editShortName}
                onChange={(event) => setEditShortName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700 md:col-span-2">
              Qualification type
              <select
                value={editQualificationTypeId}
                onChange={(event) =>
                  setEditQualificationTypeId(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
              >
                <option value="">Not assigned</option>
                {qualificationTypes.map((qualification) => (
                  <option key={qualification.id} value={qualification.id}>
                    {qualification.name}
                    {qualification.short_name
                      ? ` (${qualification.short_name})`
                      : ""}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-slate-500">
                Choose “Not assigned” if the programme has not yet been
                classified.
              </span>
            </label>

            <label className="block text-sm font-medium text-slate-700 md:col-span-2">
              Description
              <textarea
                rows={3}
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
              <input
                type="checkbox"
                checked={editActive}
                onChange={(event) => setEditActive(event.target.checked)}
              />
              Programme is active
            </label>

            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={updatingId === editingId}
                className="rounded-xl bg-[#102A43] px-5 py-3 font-semibold text-white disabled:opacity-50"
              >
                {updatingId === editingId ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={resetEdit}
                disabled={updatingId === editingId}
                className="rounded-xl border border-slate-300 px-5 py-3 font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {(message || error) && (
        <div className="space-y-3" aria-live="polite">
          {message && (
            <p
              role="status"
              className="rounded-xl bg-green-50 p-4 text-sm text-green-800"
            >
              {message}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-4 text-sm text-red-800"
            >
              {error}
            </p>
          )}
        </div>
      )}

      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#102A43]">
              Programme Records
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review, edit and activate or deactivate academic programmes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refreshRecords()}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:border-[#C9A227] disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-slate-500">
            Loading programmes...
          </p>
        ) : programmes.length === 0 ? (
          <p className="py-8 text-center text-slate-500">
            No programmes found. Add a programme above to get started.
          </p>
        ) : (
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3">Programme</th>
                <th className="px-4 py-3">Short name</th>
                <th className="px-4 py-3">Qualification type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {programmes.map((programme) => (
                <tr key={programme.id} className="border-b border-slate-100">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-800">
                      {programme.name}
                    </p>
                    {programme.description && (
                      <p className="mt-1 text-xs text-slate-500">
                        {programme.description}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {programme.short_name || "—"}
                  </td>

                  <td className="px-4 py-4">
                    {programmeQualificationName(programme)}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isActive(programme.is_active)
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isActive(programme.is_active) ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={updatingId !== null || saving}
                        onClick={() => startEditing(programme)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold hover:border-[#C9A227] disabled:opacity-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={updatingId !== null || saving}
                        onClick={() => void toggleStatus(programme)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold hover:border-[#C9A227] disabled:opacity-50"
                      >
                        {updatingId === programme.id
                          ? "Updating..."
                          : isActive(programme.is_active)
                            ? "Deactivate"
                            : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}