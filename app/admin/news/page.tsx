import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import NewsManagement from "./NewsManagement";

export default function AdminNewsPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Administration"
            title="News Management"
            description="Create, edit, publish and manage official COELS news and announcements."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <NewsManagement />
        </section>
      </main>

      <Footer />
    </>
  );
}