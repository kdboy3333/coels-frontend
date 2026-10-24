import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import PaymentManagement from "./PaymentManagement";

export default function ConsultancyPaymentsPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Consultancy Administration"
            title="Consultancy Payments"
            description="Manage consultancy student payments and payment confirmations."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <PaymentManagement />
        </section>
      </main>

      <Footer />
    </>
  );
}