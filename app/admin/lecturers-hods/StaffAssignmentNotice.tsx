export default function StaffAssignmentNotice() {
  return (
    <div className="rounded-2xl border border-[#C9A227]/30 bg-[#C9A227]/10 p-6">
      <h2 className="text-lg font-bold text-[#102A43]">
        Staff Account Rules
      </h2>

      <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
        <li>
          • Main Admin can create and manage all authorised staff accounts.
        </li>

        <li>
          • HODs can create and manage authorised staff within their permitted
          school or department.
        </li>

        <li>
          • Staff members cannot create their own staff accounts.
        </li>

        <li>
          • HODs cannot create, modify or grant unrestricted Main Admin
          privileges.
        </li>

        <li>
          • The system generates a secure temporary password when a staff
          account is created.
        </li>

        <li>
          • The temporary password is sent to the staff member through email.
        </li>

        <li>
          • Staff must change the temporary password during their first login.
        </li>

        <li>
          • Staff permissions are restricted according to their assigned role,
          school and department.
        </li>

        <li>
          • All staff account changes will be recorded in the system audit
          log.
        </li>
      </ul>
    </div>
  );
}