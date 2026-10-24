"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api";

type Profile = {
  current_level?: string | null;
  academic_session?: string | null;
  programme?: {
    name?: string | null;
  } | null;
  school?: {
    name?: string | null;
  } | null;
  department?: {
    name?: string | null;
  } | null;
};

type Fee = {
  id: number;
  fee_name: string;
  level: string;
  academic_session: string;
  amount: string | number;
  is_active: boolean;
};

type MeResponse = {
  user: {
    student_profile?: Profile | null;
  };
  must_change_password: boolean;
};

type FeeResponse = {
  fees?: Fee[];
  message?: string;
};

export default function SchoolFees() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fees, setFees] = useState<Fee[]>([]);
  const [selectedFeeId, setSelectedFeeId] = useState("");

  const [paymentReference, setPaymentReference] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState("Bank Transfer");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadFees = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Your student session has expired.");
      setLoading(false);
      return;
    }

    try {
      setError("");

      const meResponse = await fetch(`${API_URL}/me`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const meData: MeResponse = await meResponse.json();

      if (!meResponse.ok) {
        throw new Error(
          meData?.must_change_password
            ? "You must change your temporary password first."
            : "Unable to load your student profile."
        );
      }

      if (meData.must_change_password) {
        window.location.href = "/student/password";
        return;
      }

      const studentProfile =
        meData.user.student_profile || null;

      setProfile(studentProfile);

      if (
        !studentProfile?.current_level ||
        !studentProfile?.academic_session
      ) {
        throw new Error(
          "Your academic level or academic session is not configured."
        );
      }

      const params = new URLSearchParams({
        level: studentProfile.current_level,
        academic_session: studentProfile.academic_session,
      });

      const feeResponse = await fetch(
        `${API_URL}/student/fee-structures?${params.toString()}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const feeData: FeeResponse = await feeResponse.json();

      if (!feeResponse.ok) {
        throw new Error(
          feeData?.message ||
            "Unable to load your applicable school fees."
        );
      }

      setFees(
        (feeData.fees ?? []).filter(
          (fee) => fee.is_active !== false
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load school fees."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFees();
  }, [loadFees]);

  const selectedFee = fees.find(
    (fee) => fee.id === Number(selectedFeeId)
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setError("");
    setMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Your student session has expired.");
      setSubmitting(false);
      return;
    }

    if (!selectedFee) {
      setError("Please select the applicable school fee.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/school-fee-payments`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fee_structure_id: selectedFee.id,
            amount: Number(selectedFee.amount),
            payment_reference: paymentReference.trim(),
            transaction_id: transactionId.trim() || null,
            payment_method: paymentMethod,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const validationErrors = data?.errors
          ? Object.values(data.errors).flat().join(" ")
          : "";

        throw new Error(
          validationErrors ||
            data?.message ||
            "School-fee payment submission failed."
        );
      }

      setMessage(
        `${data.message} Your payment is now awaiting confirmation by the College. Your permanent registration number will be generated after confirmation.`
      );

      setPaymentReference("");
      setTransactionId("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit school-fee payment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function formatAmount(amount: string | number) {
    return `₦${Number(amount).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Your Academic Fee Information
        </h2>

        {loading ? (
          <p className="mt-4 text-sm text-slate-600">
            Loading your academic and fee information...
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Programme
              </p>

              <p className="mt-2 font-bold text-[#102A43]">
                {profile?.programme?.name || "Not available"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                School
              </p>

              <p className="mt-2 font-bold text-[#102A43]">
                {profile?.school?.name || "Not available"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Department
              </p>

              <p className="mt-2 font-bold text-[#102A43]">
                {profile?.department?.name || "Not available"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Level / Session
              </p>

              <p className="mt-2 font-bold text-[#102A43]">
                {profile?.current_level || "Not available"} /{" "}
                {profile?.academic_session || "Not available"}
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-700">
          {message}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Applicable School Fees
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          The system only displays active fees matching your programme,
          school, department, level and academic session.
        </p>

        {fees.length === 0 && !loading ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">
            No active fee structure is currently configured for your
            academic record.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {fees.map((fee) => (
              <label
                key={fee.id}
                className={`block cursor-pointer rounded-xl border p-5 ${
                  selectedFeeId === String(fee.id)
                    ? "border-[#102A43] bg-slate-50"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="radio"
                    name="fee"
                    value={fee.id}
                    checked={selectedFeeId === String(fee.id)}
                    onChange={(event) =>
                      setSelectedFeeId(event.target.value)
                    }
                    className="mt-1"
                  />

                  <div>
                    <p className="font-bold text-[#102A43]">
                      {fee.fee_name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {fee.level} • {fee.academic_session}
                    </p>

                    <p className="mt-3 text-xl font-extrabold text-[#102A43]">
                      {formatAmount(fee.amount)}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {selectedFee && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-[#102A43]">
            Submit School-Fee Payment
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            The full configured amount must be paid. Partial payment
            is not accepted.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Payment Reference
              </label>

              <input
                required
                type="text"
                value={paymentReference}
                onChange={(event) =>
                  setPaymentReference(event.target.value)
                }
                placeholder="Enter payment reference"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Transaction ID
              </label>

              <input
                type="text"
                value={transactionId}
                onChange={(event) =>
                  setTransactionId(event.target.value)
                }
                placeholder="Optional transaction ID"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Payment Method
              </label>

              <select
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#102A43]"
              >
                <option value="Bank Transfer">
                  Bank Transfer
                </option>
                <option value="Payment Gateway">
                  Payment Gateway
                </option>
                <option value="POS">POS</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div className="rounded-xl border border-[#C9A227] bg-yellow-50 p-5">
              <p className="text-sm text-slate-700">
                Amount to submit:
              </p>

              <p className="mt-1 text-2xl font-extrabold text-[#102A43]">
                {formatAmount(selectedFee.amount)}
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-[#102A43] px-6 py-3 font-bold text-white hover:bg-[#243B53] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Submitting Payment..."
                : "Submit Payment"}
            </button>
          </form>
        </div>
      )}

      <div className="rounded-2xl border border-[#C9A227]/30 bg-[#C9A227]/10 p-6">
        <h3 className="font-bold text-[#102A43]">
          Registration Number Rule
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-700">
          Your permanent registration number is not entered manually.
          After the first school-fee payment is confirmed by the
          College, the system checks your school, department and
          registration year, assigns the next sequence number, and
          changes your username to that registration number.
        </p>
      </div>
    </div>
  );
}