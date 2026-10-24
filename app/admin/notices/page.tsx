import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import NoticeManagement from "./NoticeManagement";

export default function NoticesPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Administration"
            title="Notifications & Notices"
            description="Create and manage notices, announcements and targeted notifications for students and staff."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <NoticeManagement />
        </section>
      </main>

      <Footer />
    </>
  );
}