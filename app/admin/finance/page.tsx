import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import FeeStructure from "./FeeStructure";
import PaymentRecords from "./PaymentRecords";
import FinanceNotice from "./FinanceNotice";

export default function FinancePage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Administration"
            title="Fees & Payments"
            description="Manage fee structures, payment records and payment confirmation."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <div className="grid gap-8 lg:grid-cols-2">
            <FeeStructure />
            <PaymentRecords />
          </div>

          <div className="mt-10">
            <FinanceNotice />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}