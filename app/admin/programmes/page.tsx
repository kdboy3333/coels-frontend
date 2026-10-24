import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import ProgrammeManagement from "./ProgrammeManagement";

export default function ProgrammesPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Academic Structure"
            title="Programme Management"
            description="Create, edit, activate and deactivate programmes without changing application code."
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