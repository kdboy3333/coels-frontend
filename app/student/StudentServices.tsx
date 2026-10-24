import Link from "next/link";

const services = [
  {
    name: "Course Registration",
    description: "Register and manage your courses.",
    href: "/student/course-registration",
  },
  {
    name: "School Fees",
    description: "View fee structures and submit payments.",
    href: "/student/fees",
  },
  {
    name: "Payment History",
    description: "View your school-fee payment records.",
    href: "/student/fees",
  },
  {
    name: "Fee Receipt",
    description: "View and print receipts for confirmed payments.",
    href: "/student/fee-receipt",
  },
  {
    name: "Registration Slip",
    description: "View and print your registered courses.",
    href: "/student/registration-slip",
  },
  {
    name: "My Profile",
    description: "View your personal and academic information.",
    href: "/student/profile",
  },
  {
    name: "Password Change",
    description: "Change your student account password.",
    href: "/student/password",
  },
  {
    name: "Results",
    description: "View your published examination results.",
    href: "/student/results",
  },
  {
    name: "Result Printing",
    description: "Open your academic results and print or save them as PDF.",
    href: "/student/results",
  },
];

const comingSoonServices = [
  {
    name: "Notifications",
    description: "View important student announcements.",
  },
  {
    name: "Summer",
    description: "Access eligible summer carry-over services.",
  },
  {
    name: "SAWES",
    description: "Access applicable SAWES services.",
  },
];

const externalServices = [
  {
    name: "NELFUND",
    description: "Access the student loan application service.",
    href: "https://nelf.gov.ng/",
  },
];

export default function StudentServices() {
  return (
    <section>
      <h2 className="text-2xl font-extrabold text-[#102A43]">
        Student Services
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        Access your academic records, payments, and student services.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Link
            key={service.name}
            href={service.href}
            className="group block rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#102A43] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#102A43] focus-visible:ring-offset-2"
          >
            <h3 className="font-bold text-[#102A43]">
              {service.name}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {service.description}
            </p>

            <p className="mt-4 text-sm font-semibold text-[#102A43] group-hover:underline">
              Open service →
            </p>
          </Link>
        ))}

        {comingSoonServices.map((service) => (
          <div
            key={service.name}
            aria-disabled="true"
            className="rounded-xl border border-slate-200 bg-slate-50 p-6"
          >
            <h3 className="font-bold text-[#102A43]">
              {service.name}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {service.description}
            </p>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Not yet available
            </p>
          </div>
        ))}

        {externalServices.map((service) => (
          <a
            key={service.name}
            href={service.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#102A43] focus-visible:ring-offset-2"
          >
            <h3 className="font-bold text-[#102A43]">
              {service.name}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {service.description}
            </p>

            <p className="mt-4 text-sm font-semibold text-[#102A43] group-hover:underline">
              Open external service →
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}