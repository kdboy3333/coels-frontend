import Header from "../components/Header";
import Footer from "../components/Footer";
import SectionTitle from "../components/SectionTitle";
import StudentDashboard from "./StudentDashboard";
import StudentServices from "./StudentServices";
import StudentNotice from "./StudentNotice";

export default function StudentPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Student Portal"
            title="Student Dashboard"
            description="Access your academic, financial and student services."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <StudentDashboard />

          <div className="mt-10">
            <StudentServices />
          </div>

          <div className="mt-10">
            <StudentNotice />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}