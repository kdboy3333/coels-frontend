"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type Programme = {
  id: number;
  name: string;
  short_name?: string | null;
};

type School = {
  id: number;
  name: string;
  short_name?: string | null;
};

type Department = {
  id: number;
  school_id: number;
  name: string;
  short_name?: string | null;
};

type FeeStructure = {
  id: number;
  fee_name: string;
  programme_id: number;
  school_id: number;
  department_id: number;
  level: string;
  academic_session: string;
  amount: string | number;
  is_active: boolean;
  programme?: Programme | null;
  school?: School | null;
  department?: Department | null;
};

type ApiError = {
  message?: string;
};

const API_URL = "http://127.0.0.1:8000/api";

const LEVELS = [
  "NCE 1",
  "NCE 2",
  "NCE 3",
  "ND 1",
  "ND 2",
];

function extractList<T>(data: unknown, key: string): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (
    typeof data === "object" &&
    data !== null &&
    key in data
  ) {
    const value = (data as Record<string, unknown>)[key];

    if (Array.isArray(value)) {
      return value as T[];
    }
  }

  return [];
}

export default function FeeStructure() {
  const [fees, setFees] = useState<FeeStructure[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [feeName, setFeeName] = useState("School Fee");
  const [programmeId, setProgrammeId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [level, setLevel] = useState("NCE 1");
  const [session, setSession] = useState("2025/2026");
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyFeeId, setBusyFeeId] = useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") ||
        localStorage.getItem("coels_token")
      : null;

  const requestHeaders = useMemo(
    () => ({
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    }),
    [token]
  );

  const loadData = useCallback(async () => {
    if (!token) {
      setError("Admin login token was not found.");
      setLoading(false);
      return;
    }

    try {
      setError("");

      const [
        feesResponse,
        programmesResponse,
        schoolsResponse,
        departmentsResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/fee-structures`, {
          headers: requestHeaders,
        }),
        fetch(`${API_URL}/programmes`, {
          headers: requestHeaders,
        }),
        fetch(`${API_URL}/schools`, {
          headers: requestHeaders,
        }),
        fetch(`${API_URL}/departments`, {
          headers: requestHeaders,
        }),
      ]);

      const feesData = await feesResponse.json();
      const programmesData = await programmesResponse.json();
      const schoolsData = await schoolsResponse.json();
      const departmentsData = await departmentsResponse.json();

      if (!feesResponse.ok) {
        throw new Error(
          (feesData as ApiError)?.message ||
            "Unable to load fee structures."
        );
      }

      if (!programmesResponse.ok) {
        throw new Error(
          (programmesData as ApiError)?.message ||
            "Unable to load programmes."
        );
      }

      if (!schoolsResponse.ok) {
        throw new Error(
          (schoolsData as ApiError)?.message ||
            "Unable to load schools."
        );
      }

      if (!departmentsResponse.ok) {
        throw new Error(
          (departmentsData as ApiError)?.message ||
            "Unable to load departments."
        );
      }

      setFees(
        extractList<FeeStructure>(
          feesData,
          "fee_structures"
        )
      );

      setProgrammes(
        extractList<Programme>(
          programmesData,
          "programmes"
        )
      );

      setSchools(
        extractList<School>(
          schoolsData,
          "schools"
        )
      );

      setDepartments(
        extractList<Department>(
          departmentsData,
          "departments"
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load fee management data."
      );
    } finally {
      setLoading(false);
    }
  }, [requestHeaders, token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const availableDepartments = useMemo(() => {
    if (!schoolId) {
      return departments;
    }

    return departments.filter(
      (department) =>
        department.school_id === Number(schoolId)
    );
  }, [departments, schoolId]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError("Admin login token was not found.");
      return;
    }

    if (
      !feeName.trim() ||
      !programmeId ||
      !schoolId ||
      !departmentId ||
      !level ||
      !session.trim() ||
      !amount
    ) {
      setError(
        "Please complete all required fee-structure fields."
      );
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid fee amount greater than zero.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `${API_URL}/fee-structures`,
        {
          method: "POST",
          headers: requestHeaders,
          body: JSON.stringify({
            fee_name: feeName.trim(),
            programme_id: Number(programmeId),
            school_id: Number(schoolId),
            department_id: Number(departmentId),
            level: level.trim(),
            academic_session: session.trim(),
            amount: numericAmount,
            is_active: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to create the fee structure."
        );
      }

      setMessage(
        data?.message ||
          "Fee structure created successfully."
      );

      setAmount("");

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create the fee structure."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (fee: FeeStructure) => {
    if (!token) {
      setError("Admin login token was not found.");
      return;
    }

    setBusyFeeId(fee.id);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/fee-structures/${fee.id}`,
        {
          method: "PATCH",
          headers: requestHeaders,
          body: JSON.stringify({
            fee_name: fee.fee_name,
            programme_id: fee.programme_id,
            school_id: fee.school_id,
            department_id: fee.department_id,
            level: fee.level,
            academic_session: fee.academic_session,
            amount: Number(fee.amount),
            is_active: !fee.is_active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to update fee structure status."
        );
      }

      setMessage(
        data?.message ||
          "Fee structure status updated successfully."
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update fee structure."
      );
    } finally {
      setBusyFeeId(null);
    }
  };

  const deleteFee = async (fee: FeeStructure) => {
    if (!token) {
      setError("Admin login token was not found.");
      return;
    }

    const confirmed = window.confirm(
      `Delete "${fee.fee_name}" for ${fee.academic_session}?`
    );

    if (!confirmed) {
      return;
    }

    setBusyFeeId(fee.id);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/fee-structures/${fee.id}`,
        {
          method: "DELETE",
          headers: requestHeaders,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to delete fee structure."
        );
      }

      setMessage(
        data?.message ||
          "Fee structure deleted successfully."
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete fee structure."
      );
    } finally {
      setBusyFeeId(null);
    }
  };

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#C9A227]">
            Finance
          </p>

          <h2 className="mt-1 text-2xl font-bold text-[#102A43]">
            Department-Specific Fee Structure
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Create fee amounts for specific programmes, schools,
            departments, levels and academic sessions.
          </p>
        </div>

        {message && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 grid gap-5 md:grid-cols-2"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Fee Name
            </label>

            <input
              type="text"
              value={feeName}
              onChange={(event) =>
                setFeeName(event.target.value)
              }
              placeholder="e.g. School Fee"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Programme
            </label>

            <select
              value={programmeId}
              onChange={(event) =>
                setProgrammeId(event.target.value)
              }
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#102A43]"
            >
              <option value="">
                Select programme
              </option>

              {programmes.map((programme) => (
                <option
                  key={programme.id}
                  value={programme.id}
                >
                  {programme.name}
                  {programme.short_name
                    ? ` (${programme.short_name})`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              School
            </label>

            <select
              value={schoolId}
              onChange={(event) => {
                setSchoolId(event.target.value);
                setDepartmentId("");
              }}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#102A43]"
            >
              <option value="">
                Select school
              </option>

              {schools.map((school) => (
                <option
                  key={school.id}
                  value={school.id}
                >
                  {school.name}
                  {school.short_name
                    ? ` (${school.short_name})`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Department
            </label>

            <select
              value={departmentId}
              onChange={(event) =>
                setDepartmentId(event.target.value)
              }
              required
              disabled={!schoolId}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#102A43] disabled:bg-slate-100"
            >
              <option value="">
                {schoolId
                  ? "Select department"
                  : "Select school first"}
              </option>

              {availableDepartments.map((department) => (
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
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Level
            </label>

            <select
              value={level}
              onChange={(event) =>
                setLevel(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#102A43]"
            >
              {LEVELS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Academic Session
            </label>

            <input
              type="text"
              value={session}
              onChange={(event) =>
                setSession(event.target.value)
              }
              placeholder="2025/2026"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Amount (₦)
            </label>

            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              placeholder="Enter amount"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-[#102A43] px-6 py-3 font-semibold text-white hover:bg-[#243B53] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving Fee Structure..."
                : "Save Fee Structure"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#102A43]">
              Fee Structure Records
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              These records are stored in the COELS database.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {fees.length} record{fees.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <div className="mt-6 rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">
            Loading fee structures...
          </div>
        ) : fees.length === 0 ? (
          <div className="mt-6 rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">
            No fee structures have been created yet.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-[1200px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-4 py-3">Fee</th>
                  <th className="px-4 py-3">Programme</th>
                  <th className="px-4 py-3">School</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {fees.map((fee) => (
                  <tr
                    key={fee.id}
                    className="border-b border-slate-100"
                  >
                    <td className="px-4 py-4 font-semibold text-[#102A43]">
                      {fee.fee_name}
                    </td>

                    <td className="px-4 py-4">
                      {fee.programme?.name || "—"}
                    </td>

                    <td className="px-4 py-4">
                      {fee.school?.name || "—"}
                    </td>

                    <td className="px-4 py-4">
                      {fee.department?.name || "—"}
                    </td>

                    <td className="px-4 py-4">
                      {fee.level}
                    </td>

                    <td className="px-4 py-4">
                      {fee.academic_session}
                    </td>

                    <td className="px-4 py-4 font-bold">
                      ₦
                      {Number(fee.amount).toLocaleString(
                        "en-NG",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          fee.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {fee.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            toggleStatus(fee)
                          }
                          disabled={
                            busyFeeId === fee.id
                          }
                          className="rounded-lg border border-[#102A43] px-3 py-2 text-xs font-semibold text-[#102A43] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busyFeeId === fee.id
                            ? "Working..."
                            : fee.is_active
                              ? "Deactivate"
                              : "Activate"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteFee(fee)
                          }
                          disabled={
                            busyFeeId === fee.id
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-bold text-[#102A43]">
          Fee Management Rules
        </h2>

        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
          <li>
            • Each fee structure is linked to a programme, school,
            department, level and academic session.
          </li>
          <li>
            • Fees can be activated or deactivated without deleting
            the record.
          </li>
          <li>
            • Students will only receive active fee structures that
            match their academic details.
          </li>
          <li>
            • Students must pay the applicable full amount; partial
            payment is not allowed.
          </li>
          <li>
            • A confirmed first school-fee payment triggers the
            permanent registration-number process.
          </li>
        </ul>
      </div>
    </section>
  );
}