import Header from "../components/Header";
import Footer from "../components/Footer";
import SectionTitle from "../components/SectionTitle";

export default function AboutPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="About COELS"
            title="College of Education and Legal Studies"
            description="KNOWLEDGE IS TREASURE."
          />
        </section>

        <section className="mx-auto max-w-5xl px-5 py-20">
          <h2 className="text-3xl font-extrabold text-[#102A43]">
            About the College
          </h2>

          <p className="mt-6 leading-8 text-slate-600">
            The College of Education and Legal Studies is located in Nguru,
            Yobe State, Nigeria. The College provides academic and professional
            programmes through its schools, departments and academic centres.
          </p>

          <p className="mt-5 leading-8 text-slate-600">
            COELS is committed to providing students with opportunities for
            academic development, professional preparation and the acquisition
            of relevant knowledge and skills.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}