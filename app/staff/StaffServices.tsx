"use client";

import { useRouter } from "next/navigation";

const services = [
  {
    name: "My Profile",
    description: "Access your authorised profile.",
    route: "/staff/profile",
  },
  {
    name: "Assigned Courses",
    description: "Manage and view your authorised courses.",
    route: "/staff/courses",
  },
  {
    name: "Student Records",
    description: "Access authorised student records.",
    route: "/staff/students",
  },
  {
    name: "Results",
    description: "Enter and manage authorised student results.",
    route: "/staff/results",
  },
  {
    name: "Notifications",
    description: "View your authorised notifications.",
    route: "/staff/notifications",
  },
  {
    name: "Documents",
    description: "Access authorised documents.",
    route: "/staff/documents",
  },
  {
    name: "Password Change",
    description: "Change your account password.",
    route: "/student/password",
  },
];

export default function StaffServices() {
  const router = useRouter();

  return (
    <div>
      <h2 className="text-2xl font-extrabold text-[#102A43]">
        Authorised Services
      </h2>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <button
            key={service.name}
            type="button"
            onClick={() => router.push(service.route)}
            className="rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h3 className="font-bold text-[#102A43]">
              {service.name}
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              {service.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}