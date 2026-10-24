"use client";

import { useState } from "react";

const initialLogs = [
  {
    id: 1,
    user: "Main Admin",
    action: "Updated system settings",
    module: "System Settings",
    date: "2025/2026",
    status: "Success",
  },
  {
    id: 2,
    user: "HOD",
    action: "Added staff account",
    module: "Staff Management",
    date: "2025/2026",
    status: "Success",
  },
  {
    id: 3,
    user: "Bursary Staff",
    action: "Confirmed payment",
    module: "Finance & Payments",
    date: "2025/2026",
    status: "Success",
  },
];

export default function AuditLogsManagement() {
  const [logs] = useState(initialLogs);

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          System Audit Logs
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Track important administrative activities and changes made in the
          COELS portal.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h3 className="text-xl font-bold text-[#102A43]">
            Activity Records
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">
                  User
                </th>
                <th className="px-6 py-4 font-semibold text-slate-700">
                  Action
                </th>
                <th className="px-6 py-4 font-semibold text-slate-700">
                  Module
                </th>
                <th className="px-6 py-4 font-semibold text-slate-700">
                  Session
                </th>
                <th className="px-6 py-4 font-semibold text-slate-700">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-slate-200">
                  <td className="px-6 py-4 font-semibold text-[#102A43]">
                    {log.user}
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    {log.action}
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    {log.module}
                  </td>

                  <td className="px-6 py-4 text-slate-700">
                    {log.date}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-xl font-bold text-[#102A43]">
          Audit Log Rules
        </h3>

        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
          <li>• Important administrative actions must be recorded.</li>
          <li>• Logs should record the user and affected module.</li>
          <li>• Logs should record the action and date/time.</li>
          <li>• Audit records should not be deleted by normal staff.</li>
          <li>• Main Admin can review system-wide audit records.</li>
          <li>• Backend will store the permanent audit history.</li>
        </ul>
      </div>
    </section>
  );
}
