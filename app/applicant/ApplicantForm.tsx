import Header from "../components/Header";
import Footer from "../components/Footer";
import SectionTitle from "../components/SectionTitle";
import ApplicantForm from "./ApplicantForm";
import ApplicantSteps from "./ApplicantSteps";
import ApplicantNotice from "./ApplicantNotice";

export default function ApplicantPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Applicant Portal"
            title="Apply for Admission"
            description="Create your applicant account and begin your COELS admission application."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20">
          <ApplicantSteps />

          <div className="mt-10">
            <ApplicantNotice />
          </div>

          <div className="mx-auto mt-12 max-w-3xl">
            <ApplicantForm />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}