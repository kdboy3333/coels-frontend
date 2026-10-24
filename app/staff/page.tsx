import Header from "../components/Header";
import Footer from "../components/Footer";
import SectionTitle from "../components/SectionTitle";
import StaffDashboard from "./StaffDashboard";
import StaffServices from "./StaffServices";
import StaffNotice from "./StaffNotice";

export default function StaffPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Staff Portal"
            title="Staff Dashboard"
            description="Access the services and functions authorised for your staff role."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <StaffDashboard />

          <div className="mt-10">
            <StaffServices />
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