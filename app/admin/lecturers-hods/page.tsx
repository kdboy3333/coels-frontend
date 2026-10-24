import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import LecturerList from "./LecturerList";
import HODManagement from "./HODManagement";
import StaffAssignmentNotice from "./StaffAssignmentNotice";

export default function LecturersHODsPage() {
  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Staff Management"
            title="Lecturers & HODs"
            description="Manage lecturers, Heads of Department, staff assignments, roles and authorised access."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <LecturerList />

          <div className="mt-10">
            <HODManagement />
          </div>

          <div className="mt-10">
            <StaffAssignmentNotice />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}