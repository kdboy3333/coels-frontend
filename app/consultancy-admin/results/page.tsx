import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import ResultManagement from "./ResultManagement";

export default function ConsultancyResultsPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Consultancy Administration"
            title="Consultancy Results"
            description="Enter and manage results for consultancy students."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <ResultManagement />
        </section>
      </main>

      <Footer />
    </>
  );
}