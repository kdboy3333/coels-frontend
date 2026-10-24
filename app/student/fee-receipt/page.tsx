"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = "http://127.0.0.1:8000/api";

type PaymentMetadata = {
  fee_name?: string;
  academic_session?: string;
  level?: string | number;
  fee_structure_id?: number;
};

type Payment = {
  id: number;
  amount: string | number;
  payment_reference: string;
  transaction_id?: string | null;
  payment_method?: string | null;
  status: string;
  paid_at?: string | null;
  created_at?: string | null;
  metadata?: PaymentMetadata | null;
};

type Student = {
  name?: string;
  email?: string;
  registration_number?: string | null;
  admission_number?: string | null;
  academic_session?: string | null;
  programme?: string | null;
  school?: string | null;
  department?: string | null;
};

type PaymentResponse = {
  message?: string;
  student?: Student;
  payments?: Payment[];
};

type MeResponse = {
  must_change_password?: boolean;
};

export default function FeeReceiptPage() {
  const router = useRouter();

  const [student, setStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPayments = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/portal");
      return;
    }

    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      setError("");

      const meResponse = await fetch(`${API_URL}/me`, { headers });

      if (!meResponse.ok) {
        throw new Error(
          "Unable to verify your account. Please sign in again."
        );
      }

      const me = (await meResponse.json()) as MeResponse;

      if (me.must_change_password) {
        router.replace("/student/password");
        return;
      }

      const response = await fetch(
        `${API_URL}/student/school-fee-payments`,
        { headers }
      );

      const data = (await response.json()) as PaymentResponse;

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to retrieve your payments."
        );
      }

      setStudent(data.student || null);
      setPayments(Array.isArray(data.payments) ? data.payments : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const confirmedPayments = payments.filter(
    (payment) => payment.status?.toLowerCase() === "confirmed"
  );

  const pendingPayments = payments.filter(
    (payment) => payment.status?.toLowerCase() === "pending"
  );

  function money(amount: string | number) {
    const value = Number(amount);

    return Number.isFinite(value)
      ? `₦${value.toLocaleString("en-NG", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : `₦${amount}`;
  }

  function date(value?: string | null) {
    if (!value) return "Not available";

    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime())
      ? value
      : parsed.toLocaleDateString("en-NG", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
  }

  function detail(value?: string | number | null) {
    return value === null || value === undefined || value === ""
      ? "Not available"
      : String(value);
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 print:min-h-0 print:bg-white print:p-0">
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 14mm;
        }

        @media print {
          html,
          body {
            background: #fff !important;
            color: #111827 !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          body * {
            visibility: visible;
          }

          .receipt-page {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .receipt-card {
            box-sizing: border-box;
            width: 100%;
            margin: 0 !important;
            padding: 8mm !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: #fff !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .receipt-card + .receipt-card {
            break-before: page;
            page-break-before: always;
          }

          .receipt-details {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px 20px !important;
          }

          .receipt-amount {
            background: #f8fafc !important;
            border: 1px solid #cbd5e1 !important;
          }

          .receipt-footer {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .receipt-status {
            color: #166534 !important;
            border-color: #15803d !important;
          }

          a {
            color: inherit !important;
            text-decoration: none !important;
          }
        }
      `}</style>

      <div className="receipt-page mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/student"
            className="font-semibold text-[#102A43] hover:underline"
          >
            ← Back to Student Dashboard
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            disabled={loading || confirmedPayments.length === 0 || !!error}
            className="rounded-lg bg-[#102A43] px-5 py-3 font-bold text-white hover:bg-[#183e5c] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Print / Save as PDF
          </button>
        </div>

        <header className="mb-6 print:hidden">
          <h1 className="text-3xl font-extrabold text-[#102A43]">
            Fee Receipts
          </h1>
          <p className="mt-2 text-slate-600">
            View and print official receipts for school-fee payments
            confirmed by COELS.
          </p>
        </header>

        {loading && (
          <div className="rounded-xl bg-white p-6 text-slate-600 print:hidden">
            Loading your payment records...
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-xl bg-red-50 p-6 text-red-700 print:hidden"
          >
            <p className="font-bold">Unable to load fee receipts</p>
            <p className="mt-2 text-sm">{error}</p>

            <button
              type="button"
              onClick={() => {
                setLoading(true);
                void loadPayments();
              }}
              className="mt-4 rounded-lg bg-red-700 px-4 py-2 font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {confirmedPayments.length === 0 && (
              <section className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-950 print:hidden">
                <h2 className="font-bold">
                  No confirmed fee receipts yet
                </h2>

                <p className="mt-2 text-sm leading-6">
                  A receipt becomes available after the Super Admin confirms
                  your payment. Submitting a payment alone does not mean it
                  has been confirmed.
                </p>

                {pendingPayments.length > 0 && (
                  <p className="mt-3 text-sm font-semibold">
                    You have {pendingPayments.length} payment(s) awaiting
                    confirmation.
                  </p>
                )}

                <Link
                  href="/student/fees"
                  className="mt-4 inline-block font-bold underline"
                >
                  View School Fees and Payments
                </Link>
              </section>
            )}

            {confirmedPayments.map((payment) => {
              const receiptDetails: [string, string | number | null | undefined][] =
                [
                  ["Receipt / Payment ID", `COELS-${payment.id}`],
                  ["Payment Reference", payment.payment_reference],
                  ["Student Name", student?.name],
                  ["Registration Number", student?.registration_number],
                  ["Admission Number", student?.admission_number],
                  [
                    "Fee Description",
                    payment.metadata?.fee_name || "School Fee",
                  ],
                  [
                    "Academic Session",
                    payment.metadata?.academic_session ||
                      student?.academic_session,
                  ],
                  ["Programme", student?.programme],
                  ["School", student?.school],
                  ["Department", student?.department],
                  ["Payment Method", payment.payment_method],
                  ["Transaction ID", payment.transaction_id],
                  ["Date Paid", date(payment.paid_at)],
                ];

              return (
                <article
                  key={payment.id}
                  className="receipt-card mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-9 print:mb-0 print:rounded-none print:shadow-none"
                >
                  <header className="border-b-2 border-[#102A43] pb-5 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#102A43] text-xl font-black text-[#102A43]">
                      C
                    </div>

                    <h2 className="text-xl font-extrabold uppercase leading-tight text-[#102A43] sm:text-3xl">
                      College of Education and Legal Studies
                    </h2>

                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-600 sm:text-sm">
                      KNOWLEDGE IS TREASURE
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      COELS Student Portal
                    </p>

                    <h3 className="mt-5 text-lg font-extrabold uppercase tracking-wide sm:text-xl">
                      Official School Fee Receipt
                    </h3>

                    <p className="receipt-status mt-3 inline-block rounded-full border border-green-600 px-4 py-1 text-sm font-extrabold uppercase text-green-700">
                      Paid — Confirmed
                    </p>
                  </header>

                  <div className="receipt-details mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                    {receiptDetails.map(([label, value]) => (
                      <div
                        key={label}
                        className="min-w-0 border-b border-slate-200 pb-3"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {label}
                        </p>

                        <p className="mt-1 break-words text-sm font-bold text-slate-800">
                          {detail(value)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="receipt-amount mt-7 rounded-lg bg-slate-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Amount Confirmed
                    </p>

                    <p className="mt-2 text-3xl font-extrabold text-[#102A43]">
                      {money(payment.amount)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Amount recorded as paid in the COELS system.
                    </p>
                  </div>

                  <footer className="receipt-footer mt-12 grid grid-cols-2 gap-8">
                    <div className="pt-8">
                      <div className="border-t border-slate-500 pt-2">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-700 sm:text-sm">
                          Finance Office
                        </p>
                      </div>
                    </div>

                    <div className="pt-8">
                      <div className="border-t border-slate-500 pt-2">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-700 sm:text-sm">
                          Authorized Signature / Stamp
                        </p>
                      </div>
                    </div>
                  </footer>

                  <div className="mt-8 border-t border-dashed border-slate-300 pt-4 text-center">
                    <p className="text-xs font-semibold text-slate-600">
                      Receipt No: COELS-{payment.id}
                    </p>

                    <p className="mt-2 text-[10px] leading-5 text-slate-500">
                      This receipt reflects a payment recorded as confirmed
                      in the COELS system. Keep it for your records.
                    </p>
                  </div>
                </article>
              );
            })}

            {pendingPayments.length > 0 && (
              <section className="rounded-xl border border-amber-200 bg-white p-5 print:hidden">
                <h2 className="font-bold text-amber-800">
                  Payments Awaiting Confirmation
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  These are payment submissions, not official receipts.
                </p>

                <div className="mt-4 space-y-3">
                  {pendingPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-amber-50 p-4"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          {payment.metadata?.fee_name || "School Fee"}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          Reference: {payment.payment_reference}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold">
                          {money(payment.amount)}
                        </p>

                        <p className="text-xs font-semibold uppercase text-amber-800">
                          Pending
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}