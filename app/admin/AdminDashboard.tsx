"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl, authHeaders, getAuthToken } from "../../lib/api";

type Statistics = {
  students: number;
  applicants: number;
  pending_admissions: number;
  staff: number;
  payments: number;
  pending_payments: number;
};

type DashboardResponse = {
  statistics?: Partial<Statistics>;
  message?: string;
};

const emptyStatistics: Statistics = {
  students: 0,
  applicants: 0,
  pending_admissions: 0,
  staff: 0,
  payments: 0,
  pending_payments: 0,
};

const modules = [
  { title: "Students", route: "/admin/students", description: "Student records and registration numbers" },
  { title: "Applicants & Admissions", route: "/admin/applicants", description: "Applications and admission processing" },
  { title: "Finance & Payments", route: "/admin/finance", description: "Fees, payments and financial records" },
  { title: "Course Registration", route: "/admin/course-registration", description: "Student course registrations" },
  { title: "Courses", route: "/admin/courses", description: "Course catalogue and assignments" },
  { title: "Results", route: "/admin/results", description: "Result entry and result management" },
  { title: "Staff", route: "/admin/staff", description: "Staff records and accounts" },
  { title: "Lecturers & HODs", route: "/admin/lecturers-hods", description: "Lecturer and department-head management" },
  { title: "Programmes", route: "/admin/programmes", description: "Academic programme management" },
  { title: "Schools & Departments", route: "/admin/schools-departments", description: "Manage schools and departments" },
  { title: "Academic Structure", route: "/admin/academic-structure", description: "Academic levels and structure" },
  { title: "Academic Calendar", route: "/admin/academic-calendar", description: "Academic sessions and dates" },
  { title: "Notices", route: "/admin/notices", description: "Publish and manage notices" },
  { title: "News", route: "/admin/news", description: "Manage portal news" },
  { title: "Reports", route: "/admin/reports", description: "Institutional and academic reports" },
  { title: "Permissions", route: "/admin/permissions", description: "Roles and access permissions" },
  { title: "Audit Logs", route: "/admin/audit-logs", description: "Review recorded system activity" },
  { title: "System Settings", route: "/admin/system-settings", description: "Configure portal settings" },
];

const quickActions = [
  { title: "Add Student", route: "/admin/students/create" },
  { title: "Review Applicants", route: "/admin/applicants" },
  { title: "Manage Courses", route: "/admin/courses" },
  { title: "Manage Staff", route: "/admin/staff" },
];

async function readDashboardResponse(
  response: Response,
): Promise<DashboardResponse> {
  let data: DashboardResponse;

  try {
    data = (await response.json()) as DashboardResponse;
  } catch {
    throw new Error(
      response.ok
        ? "The server returned an invalid dashboard response."
        : `Dashboard request failed with status ${response.status}.`,
    );
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Your admin session has expired. Please sign in again.");
    }

    if (response.status === 403) {
      throw new Error("You do not have permission to view the admin dashboard.");
    }

    throw new Error(data.message || "Unable to load dashboard statistics.");
  }

  return data;
}

function formatCount(value: number): string {
  return value.toLocaleString("en-NG");
}

function formatMoney(value: number): string {
  return `₦${value.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function AdminDashboard() {
  const router = useRouter();

  const [statistics, setStatistics] = useState<Statistics>(emptyStatistics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    if (!getAuthToken()) {
      setError("Your admin session has expired. Please sign in again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrl("admin/dashboard"), {
        method: "GET",
        headers: authHeaders(),
        cache: "no-store",
      });

      const data = await readDashboardResponse(response);
      const received = data.statistics ?? {};

      setStatistics({
        students: Number(received.students ?? 0),
        applicants: Number(received.applicants ?? 0),
        pending_admissions: Number(received.pending_admissions ?? 0),
        staff: Number(received.staff ?? 0),
        payments: Number(received.payments ?? 0),
        pending_payments: Number(received.pending_payments ?? 0),
      });
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Unable to connect to the COELS server. Check that the backend is running."
          : err instanceof Error
            ? err.message
            : "Unable to load dashboard statistics.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const cards = [
    { title: "Total Students", value: formatCount(statistics.students), description: "Registered students" },
    { title: "Applicants", value: formatCount(statistics.applicants), description: "Current applicants" },
    { title: "Pending Admissions", value: formatCount(statistics.pending_admissions), description: "Awaiting admission action" },
    { title: "Staff", value: formatCount(statistics.staff), description: "Authorised staff accounts" },
    { title: "Payments", value: formatMoney(statistics.payments), description: "Confirmed payments" },
    { title: "Pending Payments", value: formatCount(statistics.pending_payments), description: "Awaiting confirmation" },
  ];

  return (
    <section className="space-y-8">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#102A43]">Dashboard Overview</h2>
            <p className="mt-2 text-sm text-slate-600">
              Monitor and manage the main activities of the COELS portal.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void loadDashboard()}
              disabled={loading}
              className="mt-3 font-semibold underline disabled:opacity-50"
            >
              Try again
            </button>
            {!getAuthToken() && (
              <button
                type="button"
                onClick={() => router.push("/portal/login")}
                className="ml-4 mt-3 font-semibold underline"
              >
                Sign in
              </button>
            )}
          </div>
        )}

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-500">{item.title}</div>
              <div className="mt-3 break-words text-3xl font-bold text-[#102A43]">
                {loading ? "..." : item.value}
              </div>
              <div className="mt-2 text-sm text-slate-600">{item.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">Quick Actions</h2>
        <p className="mt-2 text-sm text-slate-500">Shortcuts to common administrative tasks.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <button
              key={action.title}
              type="button"
              onClick={() => router.push(action.route)}
              className="rounded-lg bg-[#102A43] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#243B53] focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:ring-offset-2"
            >
              {action.title}
            </button>
          ))}
        </div>
      </div>

      <div id="admin-modules" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#102A43]">All Management Modules</h2>
          <p className="mt-2 text-sm text-slate-500">
            Open a section to manage its records. Access still depends on your account permissions.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <button
              key={module.route}
              type="button"
              onClick={() => router.push(module.route)}
              className="flex min-h-28 flex-col items-start justify-between rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-[#C9A227] hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:ring-offset-2"
            >
              <span className="font-semibold text-[#102A43]">{module.title}</span>
              <span className="mt-2 text-sm leading-5 text-slate-500">{module.description}</span>
              <span aria-hidden="true" className="mt-3 font-semibold text-[#102A43]">
                Open module →
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-bold text-[#102A43]">Pending Actions</h2>
        <ul className="mt-4 list-inside list-disc space-y-3 text-sm text-slate-700">
          <li>Pending admission approvals</li>
          <li>Pending payment confirmations</li>
          <li>Pending student registrations</li>
          <li>Pending result submissions</li>
          <li>Pending staff account actions</li>
        </ul>
      </div>
    </section>
  );
}