"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = "http://127.0.0.1:8000/api";

type DetailRow = [
  string,
  string | number | null | undefined
];

type StudentProfileData = {
  registration_number?: string | null;
  admission_number?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  registration_year?: number | string | null;
  academic_session?: string | null;
  current_level?: string | number | null;
  current_semester?: string | null;
  status?: string | null;
  programme?: {
    name?: string | null;
    short_name?: string | null;
  } | null;
  school?: {
    name?: string | null;
    short_name?: string | null;
  } | null;
  department?: {
    name?: string | null;
    short_name?: string | null;
  } | null;
};

type MeResponse = {
  user: {
    name: string;
    username: string | null;
    email: string;
    is_active: boolean;
    must_change_password: boolean;
    student_profile?: StudentProfileData | null;
  };
  must_change_password: boolean;
};

export default function StudentProfilePage() {
  const router = useRouter();

  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/portal");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/me`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result: MeResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            "Unable to load your profile. Please sign in again if your session has expired."
          );
        }

        if (result.must_change_password) {
          router.replace("/student/password");
          return;
        }

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "An unexpected error occurred."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const user = data?.user;
  const profile = user?.student_profile;

  const fullName =
    [
      profile?.first_name,
      profile?.middle_name,
      profile?.last_name,
    ]
      .filter(Boolean)
      .join(" ") ||
    user?.name ||
    "Not available";

  const academicDetails: DetailRow[] = [
    ["Registration Number", profile?.registration_number],
    ["Admission Number", profile?.admission_number],
    [
      "Programme",
      profile?.programme?.name ||
        profile?.programme?.short_name,
    ],
    [
      "School",
      profile?.school?.name ||
        profile?.school?.short_name,
    ],
    [
      "Department",
      profile?.department?.name ||
        profile?.department?.short_name,
    ],
    ["Academic Session", profile?.academic_session],
    ["Current Level", profile?.current_level],
    ["Current Semester", profile?.current_semester],
    ["Registration Year", profile?.registration_year],
  ];

  const personalDetails: DetailRow[] = [
    ["Full Name", fullName],
    ["Email Address", user?.email],
    ["Username", user?.username],
    ["Phone Number", profile?.phone],
    ["Date of Birth", profile?.date_of_birth],
    ["Gender", profile?.gender],
  ];

  function displayValue(
    value: string | number | null | undefined
  ): string {
    if (value === null || value === undefined || value === "") {
      return "Not available";
    }

    return String(value);
  }

  function detailGrid(
    title: string,
    items: DetailRow[]
  ) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-extrabold text-[#102A43]">
          {title}
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {items.map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </p>

              <p className="mt-2 break-words text-sm font-semibold text-[#102A43]">
                {displayValue(value)}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/student"
          className="inline-flex text-sm font-semibold text-[#102A43] hover:underline"
        >
          ← Back to Student Dashboard
        </Link>

        <header className="mt-6 rounded-2xl bg-[#102A43] p-7 text-white sm:p-9">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#C9A227]">
            COELS Student Portal
          </p>

          <h1 className="mt-3 text-3xl font-extrabold">
            My Profile
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-200">
            View your personal information and academic record.
            Contact the appropriate College office if any
            information needs correction.
          </p>
        </header>

        {loading && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
            Loading your profile...
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <>
            <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">
                Student Name
              </p>

              <h2 className="mt-1 text-xl font-extrabold text-[#102A43]">
                {fullName}
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Account Status:{" "}
                <strong>
                  {user?.is_active ? "Active" : "Inactive"}
                </strong>

                {profile?.status && (
                  <>
                    {" "}· Student Status:{" "}
                    <strong>{profile.status}</strong>
                  </>
                )}
              </p>
            </section>

            <div className="mt-6 space-y-6">
              {detailGrid(
                "Personal Information",
                personalDetails
              )}

              {detailGrid(
                "Academic Information",
                academicDetails
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}