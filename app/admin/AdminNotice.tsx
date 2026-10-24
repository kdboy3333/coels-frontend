export default function AdminNotice() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[#102A43] p-7 text-white">
      <h2 className="text-xl font-bold">
        Central Management
      </h2>

      <p className="mt-3 leading-7 text-slate-300">
        The administration system will control the configurable information
        used throughout the COELS portal. Changes made by authorised
        administrators will be stored in the central database and reflected
        throughout the system.
      </p>

      <p className="mt-3 leading-7 text-slate-300">
        Access to each module will be controlled by role-based permissions.
        HODs will receive only the management access assigned to their
        authorised scope.
      </p>
    </div>
  );
}