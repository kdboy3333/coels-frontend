const modules = [
  "Students",
  "Applicants",
  "Admissions",
  "Programme Types",
  "Schools",
  "Departments",
  "Courses",
  "Academic Sessions",
  "Semesters",
  "Academic Calendar",
  "Lecturers",
  "HODs",
  "Staff",
  "Fees",
  "Payments",
  "Course Registration",
  "Results",
  "Consultancy",
  "News",
  "Notices",
  "Notifications",
  "Reports",
  "System Settings",
];

export default function AdminModules() {
  return (
    <div>
      <h2 className="text-2xl font-extrabold text-[#102A43]">
        Administration Modules
      </h2>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <button
            key={module}
            type="button"
            className="rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h3 className="font-bold text-[#102A43]">{module}</h3>

            <p className="mt-2 text-sm text-slate-600">
              Manage {module.toLowerCase()}.
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}