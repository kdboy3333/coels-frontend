import Header from "../components/Header";
import Footer from "../components/Footer";
import SectionTitle from "../components/SectionTitle";
import NewsList from "./NewsList";
import NewsNotice from "./NewsNotice";

export default function NewsPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="COELS Updates"
            title="News & Notices"
            description="Latest announcements, admission information and important notices from the College."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20">
          <NewsList />

          <div className="mt-10">
            <NewsNotice />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}