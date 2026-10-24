import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import PermissionsManagement from "./PermissionsManagement";

export default function PermissionsPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Administration"
            title="User & Role Permissions"
            description="Manage staff roles, permissions, school and department access."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <PermissionsManagement />
        </section>
      </main>

      <Footer />
    </>
  );
}