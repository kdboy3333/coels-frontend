import Header from "../components/Header";
import Footer from "../components/Footer";
import SectionTitle from "../components/SectionTitle";
import ProgrammeCard from "./ProgrammeCard";
import ProgrammeType from "./ProgrammeType";
import ProgrammeNotice from "./ProgrammeNotice";

type Programme = {
  id: number;
  name: string;
  short_name?: string | null;
  description?: string | null;
  is_active?: boolean;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function getProgrammes(): Promise<Programme[]> {
  try {
    const response = await fetch(`${API_URL}/programmes`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `Failed to load programmes: HTTP ${response.status}`
      );
      return [];
    }

    const result = await response.json();

    const data = Array.isArray(result)
      ? result
      : result.programmes ?? result.data ?? [];

    if (!Array.isArray(data)) {
      return [];
    }

    return data.filter(
      (programme: Programme) => programme.is_active !== false
    );
  } catch (error) {
    console.error("Unable to connect to the programmes API:", error);
    return [];
  }
}

export default async function ProgrammesPage() {
  const programmes = await getProgrammes();

  const programmeTypes = [
    {
      code: "NCE",
      title: "National Certificate in Education",
      description:
        "NCE programmes offered through the academic schools and departments of COELS.",
    },
    {
      code: "ND",
      title: "National Diploma",
      description:
        "ND programmes offered through the academic schools and departments of COELS.",
    },
  ];

  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Academic Programmes"
            title="Programmes at COELS"
            description="Explore the academic programmes offered by the College of Education and Legal Studies."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20">
          <h2 className="mb-8 text-2xl font-bold text-slate-900">
            Programme Categories
          </h2>

          <div className="grid gap-8 md:grid-cols-2">
            {programmeTypes.map((programme) => (
              <ProgrammeCard
                key={programme.code}
                code={programme.code}
                title={programme.title}
                description={programme.description}
              />
            ))}
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-bold text-slate-900">
              Available Programmes
            </h2>

            <p className="mt-2 text-slate-600">
              Explore the programmes currently published by COELS.
            </p>

            {programmes.length > 0 ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {programmes.map((programme) => (
                  <article
                    key={programme.id}
                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="text-lg font-semibold text-slate-900">
                      {programme.name}
                    </h3>

                    {programme.short_name && (
                      <p className="mt-1 text-sm font-medium text-slate-500">
                        {programme.short_name}
                      </p>
                    )}

                    {programme.description && (
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {programme.description}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-6 rounded-lg bg-slate-50 p-5 text-slate-600">
                Programme information is currently unavailable. Please check
                again later.
              </p>
            )}
          </div>
        </section>

        <section className="bg-slate-50 px-5 py-20">
          <div className="mx-auto max-w-4xl">
            <ProgrammeType
              title="Academic Structure"
              description="COELS academic programmes are organised through programme type, schools, departments and courses."
            />

            <div className="mt-6">
              <ProgrammeNotice />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}