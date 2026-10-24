import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import StudentList from "./StudentList";
import RegistrationNumber from "./RegistrationNumber";
import StudentNotice from "./StudentNotice";

export default function StudentsPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Administration"
            title="Students & Registration Numbers"
            description="Manage student accounts and the automatic registration-number process."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <StudentList />
            </div>

            <RegistrationNumber />
          </div>

          <div className="mt-10">
            <StudentNotice />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}