"use client";

import { useState } from "react";

type Role = {
  id: number;
  role: string;
  description: string;
  permissions: string[];
};

const availablePermissions = [
  "Dashboard",
  "Student Management",
  "Applicant Management",
  "Admission Management",
  "Course Management",
  "Course Registration",
  "Result Entry",
  "Results Management",
  "Finance & Payments",
  "Staff Management",
  "Reports",
  "News Management",
  "Notice Management",
  "Academic Structure",
];

const initialRoles: Role[] = [
  {
    id: 1,
    role: "Main Admin",
    description: "System-wide administration.",
    permissions: ["All System Permissions"],
  },
  {
    id: 2,
    role: "HOD",
    description: "Manages authorised school/department activities.",
    permissions: [
      "Dashboard",
      "Student Management",
      "Course Management",
      "Course Registration",
      "Result Entry",
      "Reports",
    ],
  },
  {
    id: 3,
    role: "Lecturer",
    description: "Teaching and authorised result functions.",
    permissions: [
      "Dashboard",
      "Course Management",
      "Result Entry",
    ],
  },
  {
    id: 4,
    role: "Registry Staff",
    description: "Student and academic records.",
    permissions: [
      "Dashboard",
      "Student Management",
      "Applicant Management",
      "Admission Management",
      "Reports",
    ],
  },
  {
    id: 5,
    role: "Bursary Staff",
    description: "Fees, payments and financial records.",
    permissions: [
      "Dashboard",
      "Finance & Payments",
      "Reports",
    ],
  },
  {
    id: 6,
    role: "Academic Staff",
    description: "Authorised academic administration.",
    permissions: [
      "Dashboard",
      "Course Management",
      "Course Registration",
      "Result Entry",
      "Reports",
    ],
  },
  {
    id: 7,
    role: "Departmental Staff",
    description: "Authorised departmental activities.",
    permissions: [
      "Dashboard",
      "Student Management",
      "Course Management",
      "Reports",
    ],
  },
];

export default function PermissionsManagement() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [selectedRole, setSelectedRole] = useState("HOD");
  const [selectedPermission, setSelectedPermission] =
    useState("Student Management");
  const [message, setMessage] = useState("");

  function addPermission() {
    if (selectedRole === "Main Admin") {
      setMessage(
        "Main Admin already has full system permissions."
      );
      return;
    }

    setRoles((current) =>
      current.map((role) => {
        if (role.role !== selectedRole) {
          return role;
        }

        if (role.permissions.includes(selectedPermission)) {
          return role;
        }

        return {
          ...role,
          permissions: [
            ...role.permissions,
            selectedPermission,
          ],
        };
      })
    );

    setMessage(
      `${selectedPermission} permission added to ${selectedRole}.`
    );
  }

  function removePermission(roleName: string, permission: string) {
    setRoles((current) =>
      current.map((role) => {
        if (role.role !== roleName) {
          return role;
        }

        return {
          ...role,
          permissions: role.permissions.filter(
            (item) => item !== permission
          ),
        };
      })
    );

    setMessage(
      `${permission} permission removed from ${roleName}.`
    );
  }

  return (
    <section className="space-y-8">
      {/* Permission Assignment */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Assign Permissions
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Administrators can configure authorised permissions for
          staff roles.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Staff Role
            </label>

            <select
              value={selectedRole}
              onChange={(event) =>
                setSelectedRole(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.role}>
                  {role.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Permission
            </label>

            <select
              value={selectedPermission}
              onChange={(event) =>
                setSelectedPermission(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
            >
              {availablePermissions.map((permission) => (
                <option key={permission} value={permission}>
                  {permission}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={addPermission}
          className="mt-5 rounded-lg bg-[#102A43] px-6 py-3 font-semibold text-white hover:bg-[#243B53]"
        >
          Add Permission
        </button>

        {message && (
          <p className="mt-4 rounded-lg bg-slate-100 px-4 py-3 text-sm font-medium text-[#102A43]">
            {message}
          </p>
        )}
      </div>

      {/* Role Records */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Role Permissions
        </h2>

        <div className="mt-6 space-y-5">
          {roles.map((role) => (
            <div
              key={role.id}
              className="rounded-xl border border-slate-200 p-5"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#102A43]">
                    {role.role}
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    {role.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {role.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700"
                  >
                    {permission}

                    {role.role !== "Main Admin" && (
                      <button
                        type="button"
                        onClick={() =>
                          removePermission(
                            role.role,
                            permission
                          )
                        }
                        className="font-bold text-red-600"
                        title={`Remove ${permission}`}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Access Rules */}
      <div className="rounded-2xl border border-[#C9A227] bg-white p-6">
        <h2 className="text-xl font-bold text-[#102A43]">
          Access Control Rules
        </h2>

        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
          <li>
            • Main Admin has system-wide administrative access.
          </li>
          <li>
            • HOD access is restricted to authorised school and
            department scope.
          </li>
          <li>
            • Lecturers only receive authorised academic functions.
          </li>
          <li>
            • Registry Staff manage authorised student and academic
            records.
          </li>
          <li>
            • Bursary Staff manage finance and payment functions.
          </li>
          <li>
            • Staff cannot create their own staff accounts.
          </li>
          <li>
            • HODs cannot create or grant unrestricted Main Admin
            privileges.
          </li>
          <li>
            • Backend permissions will enforce all access rules.
          </li>
          <li>
            • Permission changes will be recorded in the audit log.
          </li>
        </ul>
      </div>
    </section>
  );
}