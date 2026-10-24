import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import ProgrammeManagement from "./ProgrammeManagement";

export default function ConsultancyProgrammesPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Consultancy Administration"
            title="Consultancy Programmes"
            description="Manage independent consultancy programmes."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <ProgrammeManagement />
        </section>
      </main>
      <Footer />
    </>
  );
}