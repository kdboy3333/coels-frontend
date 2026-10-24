import Header from "../components/Header";
import Footer from "../components/Footer";
import SectionTitle from "../components/SectionTitle";
import ConsultancyDashboard from "./ConsultancyDashboard";

export default function ConsultancyAdminPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Consultancy Administration"
            title="Consultancy Portal Dashboard"
            description="Manage consultancy intakes, programmes, courses, applicants and students."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <ConsultancyDashboard />
        </section>
      </main>

      <Footer />
    </>
  );
}