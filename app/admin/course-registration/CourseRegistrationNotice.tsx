export default function CourseRegistrationNotice() {
  return (
    <div className="rounded-2xl border border-[#C9A227]/30 bg-[#C9A227]/10 p-6">
      <h2 className="text-lg font-bold text-[#102A43]">
        Course Registration Rules
      </h2>

      <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
        <li>
          • Students can register courses for the active academic session and
          semester.
        </li>

        <li>
          • The HOD can add and manage courses within the authorised
          department.
        </li>

        <li>
          • Courses will eventually be loaded from the administrator-managed
          academic structure.
        </li>

        <li>
          • Registration status can be Draft, Submitted, Approved or
          Rejected.
        </li>

        <li>
          • Backend validation will prevent registration outside the student&apos;s
          programme, school, department or level.
        </li>
      </ul>
    </div>
  );
}