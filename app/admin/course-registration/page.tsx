"use client";

import { useCallback, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SectionTitle from "../../components/SectionTitle";
import CourseRegistrationList from "./CourseRegistrationList";
import CourseRegistrationForm from "./CourseRegistrationForm";
import CourseRegistrationNotice from "./CourseRegistrationNotice";

export default function CourseRegistrationPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshRegistrations = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Academic Management"
            title="Course Registration"
            description="Manage student course registrations using the COELS academic database."
          />
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <CourseRegistrationList refreshKey={refreshKey} />

          <div className="mt-10">
            <CourseRegistrationForm onSaved={refreshRegistrations} />
          </div>

          <div className="mt-10">
            <CourseRegistrationNotice />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}