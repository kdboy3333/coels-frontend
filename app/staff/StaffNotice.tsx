export default function StaffNotice() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7">
      <h2 className="text-xl font-bold text-[#102A43]">
        Staff Access Control
      </h2>

      <p className="mt-3 leading-7 text-slate-600">
        Staff access is controlled by role and permissions. Staff accounts
        are created by authorised administrators or HODs and cannot be
        self-created by staff members.
      </p>
    </div>
  );
}