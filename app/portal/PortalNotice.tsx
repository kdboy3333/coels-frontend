export default function PortalNotice() {
  return (
    <div className="rounded-xl border border-slate-200 bg-[#102A43] p-6 text-white">
      <h2 className="font-bold">Portal Security</h2>

      <p className="mt-2 text-sm leading-6 text-slate-300">
        Never share your password with another person. The production system
        will use secure authentication, encrypted connections and
        role-based access control.
      </p>
    </div>
  );
}