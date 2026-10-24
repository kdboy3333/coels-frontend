"use client";

import { useCallback, useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api";

type Payment = {
  id: number;
  amount: string | number;
  payment_reference: string;
  transaction_id?: string | null;
  payment_method?: string | null;
  status: string;
  paid_at?: string | null;
  created_at?: string | null;
  student_profile?: {
    id: number;
    registration_number?: string | null;
    first_name?: string | null;
    middle_name?: string | null;
    last_name?: string | null;
    academic_session?: string | null;
    current_level?: string | number | null;
    programme?: {
      name?: string | null;
      short_name?: string | null;
    } | null;
    school?: {
      name?: string | null;
      short_name?: string | null;
    } | null;
    department?: {
      name?: string | null;
      short_name?: string | null;
    } | null;
    user?: {
      name?: string | null;
      username?: string | null;
      email?: string | null;
    } | null;
  } | null;
};

type PaginatedPayments = {
  data?: Payment[];
  current_page?: number;
  last_page?: number;
  total?: number;
};

type PaymentResponse = {
  message?: string;
  payments?: Payment[] | PaginatedPayments;
};

function responseMessage(
  data: unknown,
  fallback: string
): string {
  if (
    data !== null &&
    typeof data === "object" &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  return fallback;
}

function studentName(payment: Payment): string {
  const profile = payment.student_profile;

  const name = [
    profile?.first_name,
    profile?.middle_name,
    profile?.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  return name || profile?.user?.name || "Student";
}

function formatAmount(amount: string | number): string {
  const value = Number(amount);

  if (!Number.isFinite(value)) return String(amount);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(date?: string | null): string {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusClasses(status: string): string {
  switch (status.toLowerCase()) {
    case "confirmed":
    case "successful":
    case "paid":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function PaymentRecords() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/school-fee-payments`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
          cache: "no-store",
        }
      );

      const data: PaymentResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          responseMessage(
            data,
            "Unable to load school-fee payments."
          )
        );
      }

      const payload = data.payments;

      const records: Payment[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      setPayments(records);
    } catch (err) {
      setPayments([]);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while loading payments."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const confirmPayment = async (paymentId: number) => {
    const approved = window.confirm(
      "Confirm this payment only after verifying that the money was received."
    );

    if (!approved) return;

    setConfirmingId(paymentId);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/school-fee-payments/${paymentId}/confirm`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
        }
      );

      const data: unknown = await response.json();

      if (!response.ok) {
        throw new Error(
          responseMessage(
            data,
            "Payment confirmation failed."
          )
        );
      }

      setMessage(
        responseMessage(
          data,
          "Payment confirmed successfully."
        )
      );

      await loadPayments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while confirming the payment."
      );
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            School Fee Payments
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Review student school-fee payments and confirm successful payments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadPayments()}
          disabled={loading || confirmingId !== null}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh payments"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          {message}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading school-fee payments...
          </div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center">
            <h2 className="font-semibold text-gray-800">
              No school-fee payments found
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Student payments will appear here after they are submitted.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Student",
                    "Programme / Department",
                    "Session / Level",
                    "Amount",
                    "Reference",
                    "Date",
                    "Status",
                    "Action",
                  ].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => {
                  const profile = payment.student_profile;
                  const pending =
                    payment.status.toLowerCase() === "pending";
                  const confirming = confirmingId === payment.id;

                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="font-medium text-gray-900">
                          {studentName(payment)}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          Reg. No.: {profile?.registration_number || "Not assigned"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {profile?.user?.email || "No email"}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-800">
                          {profile?.programme?.name ||
                            profile?.programme?.short_name ||
                            "—"}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {profile?.department?.name ||
                            profile?.department?.short_name ||
                            "—"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {profile?.school?.name ||
                            profile?.school?.short_name ||
                            ""}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                        <div>{profile?.academic_session || "—"}</div>
                        <div className="mt-1 text-xs text-gray-500">
                          Level {profile?.current_level ?? "—"}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-semibold text-gray-900">
                        {formatAmount(payment.amount)}
                      </td>

                      <td className="px-4 py-4">
                        <div className="max-w-48 break-all text-gray-700">
                          {payment.payment_reference || "—"}
                        </div>
                        {payment.transaction_id && (
                          <div className="mt-1 break-all text-xs text-gray-500">
                            Transaction: {payment.transaction_id}
                          </div>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                        {formatDate(payment.paid_at || payment.created_at)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(payment.status)}`}
                        >
                          {payment.status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        {pending ? (
                          <button
                            type="button"
                            onClick={() => void confirmPayment(payment.id)}
                            disabled={confirmingId !== null}
                            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {confirming ? "Confirming..." : "Confirm"}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-500">
                            No action
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Verify receipt before confirming a payment. Permanent registration
        numbers must be generated by the backend confirmation process.
      </p>
    </section>
  );
}