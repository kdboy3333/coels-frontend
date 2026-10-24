import Header from "../components/Header";
import Footer from "../components/Footer";
import SectionTitle from "../components/SectionTitle";
import AdmissionInfo from "./AdmissionInfo";
import AdmissionForm from "./AdmissionForm";
import AdmissionNotice from "./AdmissionNotice";

export default function AdmissionsPage() {
  return (
    <>
      <Header />

      <main>
        {/* Page Header */}
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Admissions"
            title="Admission to COELS"
            description="Find admission information and begin your application to the College of Education and Legal Studies."
          />
        </section>

        {/* Admission Information */}
        <section className="mx-auto max-w-7xl px-5 py-20">
          <AdmissionInfo />

          <div className="mt-10">
            <AdmissionNotice />
          </div>
        </section>

        {/* Application */}
        <section className="bg-slate-50 px-5 py-20">
          <div className="mx-auto max-w-3xl">
            <AdmissionForm />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}