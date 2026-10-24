import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import ReportManagement from "./ReportManagement";

export default function ConsultancyReportsPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Consultancy Administration"
            title="Consultancy Reports"
            description="View and manage reports for Consultancy Services."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <ReportManagement />
        </section>
      </main>

      <Footer />
    </>
  );
}