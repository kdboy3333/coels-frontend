import Header from "../components/Header";
import Footer from "../components/Footer";
import SectionTitle from "../components/SectionTitle";
import AdminDashboard from "./AdminDashboard";

export default function AdminPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Administration"
            title="Admin Dashboard"
            description="Manage students, applicants, staff, academic activities, finance, results and the COELS portal."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <AdminDashboard />
        </section>
      </main>

      <Footer />
    </>
  );
}