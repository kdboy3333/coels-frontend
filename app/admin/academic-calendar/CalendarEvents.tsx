export default function CalendarEvents() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-extrabold text-[#102A43]">
        Academic Calendar Events
      </h2>

      <p className="mt-3 leading-7 text-slate-600">
        Administrators will be able to create and manage registration dates,
        lectures, examinations, holidays, result publication dates and other
        academic events.
      </p>

      <button
        type="button"
        className="mt-6 rounded-lg bg-[#102A43] px-5 py-3 font-bold text-white"
      >
        Add Calendar Event
      </button>
    </div>
  );
}