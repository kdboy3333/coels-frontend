import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import CourseManagement from "./CourseManagement";

export default function CoursesPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Academic Structure"
            title="Course Management"
            description="Manage courses and connect each course to its programme, school, department, level and semester."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <CourseManagement />
        </section>
      </main>

      <Footer />
    </>
  );
}