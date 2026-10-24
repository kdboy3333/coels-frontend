const staff = [
  {
    name: "Staff records will appear here",
    role: "Role",
    department: "Department",
    status: "Status",
  },
];

export default function StaffList() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-extrabold text-[#102A43]">
        Staff Records
      </h2>

      <div className="mt-6 space-y-4">
        {staff.map((member) => (
          <div
            key={member.name}
            className="rounded-xl border border-slate-200 p-5"
          >
            <h3 className="font-bold text-[#102A43]">{member.name}</h3>

            <div className="mt-3 grid gap-2 text-sm text-slate-600">
              <p>Role: {member.role}</p>
              <p>Department: {member.department}</p>
              <p>Status: {member.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}