"use client";

import { useCallback, useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api";

type Payment = {
  id: number;
  status: string;
};

type Student = {
  id: number;
  registration_number?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  current_level?: string | null;
  academic_session?: string | null;
  current_semester?: string | null;
  user?: {
    name?: string | null;
    username?: string | null;
    email?: string | null;
  } | null;
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
  school_fee_payments?: Payment[];
};

type StudentsResponse = {
  students?: Student[];
  message?: string;
};

export default function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStudents = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Your admin session has expired. Please sign in again.");
      setLoading(false);
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/admin/students`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data: StudentsResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load student records."
        );
      }

      setStudents(data.students ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load student records."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  function getStudentName(student: Student) {
    const profileName = [
      student.first_name,
      student.middle_name,
      student.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    return profileName || student.user?.name || "Unnamed Student";
  }

  function getPaymentStatus(student: Student) {
    const latestPayment = [...(student.school_fee_payments ?? [])]
      .sort((a, b) => b.id - a.id)[0];

    if (!latestPayment) {
      return "No Payment";
    }

    return latestPayment.status;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#102A43]">
            Student Records
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Live student accounts and registration status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadStudents()}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-600">
          Loading student records...
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <p className="font-semibold text-slate-700">
            No student accounts found.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-3 py-3">Student</th>
                <th className="px-3 py-3">Programme</th>
                <th className="px-3 py-3">School</th>
                <th className="px-3 py-3">Department</th>
                <th className="px-3 py-3">Level</th>
                <th className="px-3 py-3">Reg. No.</th>
                <th className="px-3 py-3">Fee Status</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => {
                const paymentStatus = getPaymentStatus(student);
                const confirmed =
                  paymentStatus.toLowerCase() === "confirmed";

                return (
                  <tr
                    key={student.id}
                    className="border-b border-slate-100"
                  >
                    <td className="px-3 py-4">
                      <div className="font-semibold text-slate-800">
                        {getStudentName(student)}
                      </div>

                      <div className="text-xs text-slate-500">
                        {student.user?.username || "Temporary username"}
                      </div>

                      <div className="text-xs text-slate-500">
                        {student.user?.email || "No email"}
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      {student.programme?.short_name ||
                        student.programme?.name ||
                        "Not assigned"}
                    </td>

                    <td className="px-3 py-4">
                      {student.school?.short_name ||
                        student.school?.name ||
                        "Not assigned"}
                    </td>

                    <td className="px-3 py-4">
                      {student.department?.short_name ||
                        student.department?.name ||
                        "Not assigned"}
                    </td>

                    <td className="px-3 py-4">
                      {student.current_level || "Not assigned"}
                    </td>

                    <td className="px-3 py-4 font-semibold">
                      {student.registration_number || "Not Generated"}
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          confirmed
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {paymentStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}