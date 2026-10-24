import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import QualificationTypes from "./QualificationTypes";
import ProgrammeTypes from "./ProgrammeTypes";
import Schools from "./Schools";
import Departments from "./Departments";
import Courses from "./Courses";

export default function AcademicStructurePage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Administration"
            title="Academic Structure"
            description="Manage qualification types, programmes, schools, departments and courses from one place."
          />
        </section>

        <section className="mx-auto max-w-7xl space-y-8 px-5 py-16">
          <QualificationTypes />
          <ProgrammeTypes />
          <Schools />
          <Departments />
          <Courses />
        </section>
      </main>

      <Footer />
    </>
  );
}