import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import StaffList from "./StaffList";
import StaffForm from "./StaffForm";
import StaffNotice from "./StaffNotice";

export default function StaffManagementPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Administration"
            title="Staff Management"
            description="Authorised administrators and HODs can manage staff accounts and assignments."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <div className="grid gap-8 lg:grid-cols-2">
            <StaffForm />
            <StaffList />
          </div>

          <div className="mt-10">
            <StaffNotice />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}