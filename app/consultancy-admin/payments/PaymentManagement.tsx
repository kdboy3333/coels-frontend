"use client";

import { useState } from "react";

type Payment = {
  id: number;
  student: string;
  username: string;
  programme: string;
  intake: string;
  amountDue: number;
  amountPaid: number;
  reference: string;
  paymentDate: string;
  status: "Pending" | "Confirmed" | "Rejected";
};

const initialPayments: Payment[] = [
  {
    id: 1,
    student: "Approved Applicant",
    username: "approved.applicant",
    programme: "Certificate in Cyber Security",
    intake: "2025/2026 First Intake",
    amountDue: 150000,
    amountPaid: 150000,
    reference: "COELS-CONS-0001",
    paymentDate: "2026-09-27",
    status: "Pending",
  },
];

export default function PaymentManagement() {
  const [payments, setPayments] = useState(initialPayments);

  function updateStatus(
    id: number,
    status: "Confirmed" | "Rejected"
  ) {
    setPayments(
      payments.map((payment) =>
        payment.id === id ? { ...payment, status } : payment
      )
    );
  }

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Consultancy Payment Records
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Review, confirm and manage consultancy student payments.
        </p>

        <div className="mt-6 space-y-5">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="rounded-xl border border-slate-200 p-5"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-[#102A43]">
                    {payment.student}
                  </h3>

                  <p className="text-sm text-slate-600">
                    Username: {payment.username}
                  </p>

                  <p className="text-sm text-slate-600">
                    Programme: {payment.programme}
                  </p>

                  <p className="text-sm text-slate-600">
                    Intake: {payment.intake}
                  </p>

                  <p className="text-sm text-slate-600">
                    Amount Due: ₦{payment.amountDue.toLocaleString()}
                  </p>

                  <p className="text-sm text-slate-600">
                    Amount Paid: ₦{payment.amountPaid.toLocaleString()}
                  </p>

                  <p className="text-sm text-slate-600">
                    Reference: {payment.reference}
                  </p>

                  <p className="text-sm text-slate-600">
                    Payment Date: {payment.paymentDate}
                  </p>

                  <p className="pt-2 text-sm font-semibold">
                    Status:{" "}
                    <span
                      className={
                        payment.status === "Confirmed"
                          ? "text-green-700"
                          : payment.status === "Rejected"
                            ? "text-red-700"
                            : "text-amber-700"
                      }
                    >
                      {payment.status}
                    </span>
                  </p>
                </div>

                {payment.status === "Pending" && (
                  <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(payment.id, "Confirmed")
                      }
                      className="rounded-lg bg-[#102A43] px-5 py-3 font-semibold text-white"
                    >
                      Confirm Payment
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(payment.id, "Rejected")
                      }
                      className="rounded-lg border border-red-300 px-5 py-3 font-semibold text-red-700"
                    >
                      Reject Payment
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-bold text-[#102A43]">
          Consultancy Payment Rules
        </h2>

        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
          <li>• Every payment has a unique payment reference.</li>
          <li>• Amount due and amount paid are recorded separately.</li>
          <li>• Payment status can be Pending, Confirmed or Rejected.</li>
          <li>• Consultancy Admin can confirm or reject pending payments.</li>
          <li>• Confirmed payments will later be connected to the payment gateway.</li>
          <li>• Payment records will be permanently stored in the backend.</li>
        </ul>
      </div>
    </section>
  );
}