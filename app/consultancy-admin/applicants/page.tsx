import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import ApplicantManagement from "./ApplicantManagement";

export default function ConsultancyApplicantsPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Consultancy Administration"
            title="Consultancy Applicants"
            description="Manage consultancy applications and admission records."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <ApplicantManagement />
        </section>
      </main>

      <Footer />
    </>
  );
}