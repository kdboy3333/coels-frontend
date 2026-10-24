export default function StaffNotice() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7">
      <h2 className="text-xl font-bold text-[#102A43]">
        Staff Account Rule
      </h2>

      <p className="mt-3 leading-7 text-slate-600">
        Staff accounts are created by the Main Administrator or an authorised
        HOD. Staff members cannot create their own staff accounts. Access is
        controlled by role, school, department and assigned permissions.
      </p>
    </div>
  );
}