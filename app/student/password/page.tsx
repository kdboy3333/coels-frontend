import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import PasswordChange from "./PasswordChange";

export default function PasswordPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Student Security"
            title="Change Temporary Password"
            description="You must change your temporary password before accessing student services."
          />
        </section>

        <section className="mx-auto max-w-2xl px-5 py-16">
          <PasswordChange />
        </section>
      </main>

      <Footer />
    </>
  );
}