import Header from "../components/Header";
import Footer from "../components/Footer";
import SectionTitle from "../components/SectionTitle";
import LoginForm from "./LoginForm";
import PortalRole from "./PortalRole";
import PortalNotice from "./PortalNotice";

const roles = [
  {
    title: "Applicant",
    description: "Apply for admission and check your admission status.",
  },
  {
    title: "Student",
    description: "Access registration, fees, results and student services.",
  },
  {
    title: "Staff",
    description: "Access authorised academic and administrative services.",
  },
];

export default function PortalPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="COELS Portal"
            title="Portal Login"
            description="Access the appropriate COELS online service using your account."
          />
        </section>

        <section className="mx-auto max-w-5xl px-5 py-20">
          <div className="grid gap-8 lg:grid-cols-2">
            <LoginForm />

            <div className="space-y-5">
              {roles.map((role) => (
                <PortalRole
                  key={role.title}
                  title={role.title}
                  description={role.description}
                />
              ))}

              <PortalNotice />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}