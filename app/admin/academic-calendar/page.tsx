import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import SessionForm from "./SessionForm";
import SemesterForm from "./SemesterForm";
import CalendarEvents from "./CalendarEvents";

export default function AcademicCalendarPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Administration"
            title="Academic Calendar"
            description="Manage academic sessions, semesters and important academic dates."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <div className="grid gap-8 lg:grid-cols-2">
            <SessionForm />
            <SemesterForm />
          </div>

          <div className="mt-8">
            <CalendarEvents />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}