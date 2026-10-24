import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import IntakeManagement from "./IntakeManagement";

export default function ConsultancyIntakesPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Consultancy Administration"
            title="Consultancy Intakes"
            description="Create and manage consultancy admission intakes."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <IntakeManagement />
        </section>
      </main>
      <Footer />
    </>
  );
}