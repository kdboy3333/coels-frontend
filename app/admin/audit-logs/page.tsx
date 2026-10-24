import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import AuditLogsManagement from "./AuditLogsManagement";

export default function AuditLogsPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Administration"
            title="Audit Logs"
            description="Review important administrative activities and system changes."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <AuditLogsManagement />
        </section>
      </main>

      <Footer />
    </>
  );
}