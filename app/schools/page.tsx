import Header from "../components/Header";
import Footer from "../components/Footer";
import SectionTitle from "../components/SectionTitle";

const schools = [
  {
    name: "School of Science",
    description:
      "Academic programmes and departments within the field of science.",
  },
  {
    name: "School of Law",
    description:
      "Academic programmes focused on legal studies and related disciplines.",
  },
  {
    name: "School of Art and Social Sciences",
    description:
      "Programmes covering arts, social sciences and related areas.",
  },
  {
    name: "School of Education",
    description:
      "Programmes focused on education, teaching and professional development.",
  },
  {
    name: "School of Language",
    description:
      "Programmes covering language studies and related disciplines.",
  },
  {
    name: "Centre for Human Resource Development and Professional Studies",
    description:
      "Professional and human resource development programmes.",
  },
];

export default function SchoolsPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Academic Structure"
            title="Schools of COELS"
            description="Explore the schools and academic areas of the College of Education and Legal Studies."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {schools.map((school) => (
              <div
                key={school.name}
                className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#102A43] font-bold text-white">
                  CO
                </div>

                <h2 className="mt-6 text-xl font-bold text-[#102A43]">
                  {school.name}
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  {school.description}
                </p>

                <button className="mt-5 font-bold text-[#102A43] hover:text-[#C9A227]">
                  View Departments →
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}