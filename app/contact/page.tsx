import Header from "../components/Header";
import Footer from "../components/Footer";
import SectionTitle from "../components/SectionTitle";
import ContactInfo from "./ContactInfo";
import ContactForm from "./ContactForm";
import ContactNotice from "./ContactNotice";

export default function ContactPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Contact COELS"
            title="Get in Touch"
            description="Contact the College of Education and Legal Studies, Nguru, Yobe State."
          />
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-20 lg:grid-cols-2">
          <ContactInfo />
          <ContactForm />
        </section>

        <section className="bg-slate-50 px-5 py-16">
          <div className="mx-auto max-w-4xl">
            <ContactNotice />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}