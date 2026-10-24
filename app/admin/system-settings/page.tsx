import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import SystemSettings from "./SystemSettings";

export default function SystemSettingsPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Administration"
            title="System Settings"
            description="Manage institution information, academic configuration, portal behaviour and security settings."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <SystemSettings />
        </section>
      </main>

      <Footer />
    </>
  );
}