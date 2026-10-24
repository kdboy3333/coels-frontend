"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://127.0.0.1:8000/api";

type StudentProfile = {
  registration_number?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  academic_session?: string | null;
  current_level?: string | null;
  current_semester?: string | null;
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

type UserResponse = {
  user: {
    name: string;
    username: string | null;
    email: string;
    role: string;
    is_active: boolean;
    must_change_password: boolean;
    student_profile?: StudentProfile | null;
  };
  must_change_password: boolean;
};

export default function StudentDashboard() {
  const router = useRouter();

  const [profile, setProfile] = useState<StudentProfile | null>(
    null
  );
  const [userName, setUserName] = useState("Student");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/portal");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/me`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data: UserResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          "Unable to load your student account."
        );
      }

      if (data.must_change_password) {
        router.push("/student/password");
        return;
      }

      setUserName(data.user.name);
      setUsername(data.user.username || "");
      setProfile(data.user.student_profile || null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load student information."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const information = [
    [
      "Registration Number",
      profile?.registration_number || "Not assigned yet",
    ],
    [
      "Programme",
      profile?.programme?.short_name ||
        profile?.programme?.name ||
        "Not available",
    ],
    [
      "School",
      profile?.school?.short_name ||
        profile?.school?.name ||
        "Not available",
    ],
    [
      "Department",
      profile?.department?.short_name ||
        profile?.department?.name ||
        "Not available",
    ],
    [
      "Academic Session",
      profile?.academic_session || "Not available",
    ],
    [
      "Current Level",
      profile?.current_level || "Not available",
    ],
    [
      "Semester",
      profile?.current_semester || "Not available",
    ],
    [
      "Username",
      username || "Not assigned",
    ],
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col justify-between gap-4 md:flex-row">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#C9A227]">
            Student Account
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-[#102A43]">
            Welcome, {loading ? "Student" : userName}
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Your academic and financial information is loaded from
            your COELS student record.
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 px-5 py-3 text-sm text-slate-600">
          Account Status:{" "}
          <strong className="text-[#102A43]">Active</strong>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {information.map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {label}
            </p>

            <p className="mt-2 text-sm font-bold text-[#102A43]">
              {loading ? "Loading..." : value}
            </p>
          </div>
        ))}
      </div>

      {!loading && !profile?.registration_number && (
        <div className="mt-8 rounded-xl border border-[#C9A227] bg-yellow-50 p-5">
          <h3 className="font-bold text-[#102A43]">
            Registration Number Pending
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            Your permanent registration number will be generated
            automatically after your first school-fee payment is
            successfully confirmed by the College.
          </p>
        </div>
      )}
    </div>
  );
}