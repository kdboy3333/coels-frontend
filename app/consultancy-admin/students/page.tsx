import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import StudentManagement from "./StudentManagement";

export default function ConsultancyStudentsPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Consultancy Administration"
            title="Consultancy Students"
            description="Manage students enrolled through Consultancy Services."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <StudentManagement />
        </section>
      </main>

      <Footer />
    </>
  );
}