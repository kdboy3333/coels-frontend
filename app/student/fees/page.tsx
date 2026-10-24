import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import SchoolFees from "./SchoolFees";

export default function StudentFeesPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Student Finance"
            title="School Fees"
            description="View the fee applicable to your academic record and submit your first school-fee payment."
          />
        </section>

        <section className="mx-auto max-w-5xl px-5 py-16">
          <SchoolFees />
        </section>
      </main>

      <Footer />
    </>
  );
}