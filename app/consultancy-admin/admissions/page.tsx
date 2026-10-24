import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import AdmissionManagement from "./AdmissionManagement";

export default function ConsultancyAdmissionsPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Consultancy Administration"
            title="Consultancy Admissions"
            description="Manage approved consultancy applicants and create student accounts."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <AdmissionManagement />
        </section>
      </main>
      <Footer />
    </>
  );
}