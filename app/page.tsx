import Header from "./components/Header";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import SectionTitle from "./components/SectionTitle";
import PortalCard from "./components/PortalCard";

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <Hero />

        <section className="bg-white px-5 py-20">
          <SectionTitle
            eyebrow="Academic Excellence"
            title="Welcome to COELS"
            description="The College of Education and Legal Studies provides academic and professional education through its schools, departments and programmes."
          />

          <div className="mx-auto mt-12 grid max-w-7xl gap-6 md:grid-cols-3">
            <PortalCard
              title="Applicant Portal"
              description="Apply for admission, submit your information and check your admission status."
              href="/applicant"
            />

            <PortalCard
              title="Student Portal"
              description="Access course registration, school fees, results and other student services."
              href="/student"
            />

            <PortalCard
              title="Staff Portal"
              description="Access lecturer, HOD, registry, bursary and administrative services."
              href="/portal"
            />
          </div>
        </section>

        <section className="bg-slate-50 px-5 py-20">
          <SectionTitle
            eyebrow="Our Structure"
            title="Schools & Programmes"
            description="Explore the academic structure of COELS, including NCE and ND programmes."
          />

          <div className="mx-auto mt-12 grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              "School of Science",
              "School of Law",
              "School of Art and Social Sciences",
              "School of Education",
              "School of Language",
              "Centre for Human Resource Development and Professional Studies",
            ].map((school) => (
              <div
                key={school}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="font-bold text-[#102A43]">{school}</h3>
                <p className="mt-3 text-sm text-slate-600">
                  View departments and programmes.
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#102A43] px-5 py-20 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#C9A227]">
            Consultancy Services
          </p>

          <h2 className="mt-3 text-3xl font-extrabold text-white md:text-4xl">
            COELS Innovations and Consultancy Services
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-300">
            Explore professional, diploma and certificate programmes offered
            through the independent Consultancy Services portal.
          </p>

          <a
            href="https://applicant.safapply.com/coelsnguru"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-lg bg-white px-7 py-3 font-bold text-[#102A43] hover:bg-slate-100"
          >
            Visit Consultancy Portal
          </a>
        </section>
      </main>

      <Footer />
    </>
  );
}