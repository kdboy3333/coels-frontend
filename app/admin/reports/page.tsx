import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import ReportsManagement from "./ReportsManagement";

export default function ReportsPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Administration"
            title="Reports"
            description="Generate and review academic, student, admission, finance, registration and results reports."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <ReportsManagement />
        </section>
      </main>

      <Footer />
    </>
  );
}