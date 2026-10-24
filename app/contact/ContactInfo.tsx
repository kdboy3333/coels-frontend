export default function ContactInfo() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#C9A227]">
        College Address
      </p>

      <h2 className="mt-3 text-2xl font-extrabold text-[#102A43]">
        College of Education and Legal Studies
      </h2>

      <div className="mt-7 space-y-5 text-slate-600">
        <div>
          <p className="font-bold text-[#102A43]">Location</p>
          <p className="mt-1">Nguru, Yobe State</p>
        </div>

        <div>
          <p className="font-bold text-[#102A43]">Postal Address</p>
          <p className="mt-1">PMB 021</p>
        </div>

        <div>
          <p className="font-bold text-[#102A43]">Motto</p>
          <p className="mt-1">KNOWLEDGE IS TREASURE.</p>
        </div>
      </div>
    </div>
  );
}