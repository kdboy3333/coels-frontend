"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import SectionTitle from "../../../components/SectionTitle";

const API_URL = "http://127.0.0.1:8000/api";

type Programme = {
  id: number;
  name: string;
  short_name?: string | null;
  is_active?: boolean;
};

type School = {
  id: number;
  programme_id: number;
  name: string;
  short_name?: string | null;
  is_active?: boolean;
};

type Department = {
  id: number;
  school_id: number;
  name: string;
  short_name?: string | null;
  is_active?: boolean;
};

type ApiListResponse<T> = {
  programmes?: T[];
  schools?: T[];
  departments?: T[];
};

export default function CreateStudentPage() {
  const router = useRouter();

  const currentYear = new Date().getFullYear();

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [programmeId, setProgrammeId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const [admissionNumber, setAdmissionNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");

  const [registrationYear, setRegistrationYear] = useState(
    currentYear.toString()
  );

  const [academicSession, setAcademicSession] = useState(
    `${currentYear}/${currentYear + 1}`
  );

  const [currentLevel, setCurrentLevel] = useState("");
  const [currentSemester, setCurrentSemester] =
    useState("First Semester");

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadAcademicStructure() {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Your admin session has expired. Please sign in again.");
        setLoadingData(false);
        return;
      }

      try {
        const headers = {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [programmeResponse, schoolResponse, departmentResponse] =
          await Promise.all([
            fetch(`${API_URL}/programmes`, { headers }),
            fetch(`${API_URL}/schools`, { headers }),
            fetch(`${API_URL}/departments`, { headers }),
          ]);

        if (
          !programmeResponse.ok ||
          !schoolResponse.ok ||
          !departmentResponse.ok
        ) {
          throw new Error(
            "Unable to load the COELS academic structure."
          );
        }

        const programmeData: ApiListResponse<Programme> =
          await programmeResponse.json();

        const schoolData: ApiListResponse<School> =
          await schoolResponse.json();

        const departmentData: ApiListResponse<Department> =
          await departmentResponse.json();

        setProgrammes(
          (programmeData.programmes ?? []).filter(
            (item) => item.is_active !== false
          )
        );

        setSchools(
          (schoolData.schools ?? []).filter(
            (item) => item.is_active !== false
          )
        );

        setDepartments(
          (departmentData.departments ?? []).filter(
            (item) => item.is_active !== false
          )
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load academic structure."
        );
      } finally {
        setLoadingData(false);
      }
    }

    void loadAcademicStructure();
  }, []);

  const selectedProgramme = programmes.find(
    (programme) => programme.id === Number(programmeId)
  );

  const availableSchools = schools.filter(
    (school) => school.programme_id === Number(programmeId)
  );

  const availableDepartments = departments.filter(
    (department) => department.school_id === Number(schoolId)
  );

  const levelOptions =
    selectedProgramme?.short_name === "NCE"
      ? ["NCE 1", "NCE 2", "NCE 3"]
      : selectedProgramme?.short_name === "ND"
        ? ["ND 1", "ND 2"]
        : ["100", "200", "300", "400"];

  function handleProgrammeChange(value: string) {
    setProgrammeId(value);
    setSchoolId("");
    setDepartmentId("");
    setCurrentLevel("");
  }

  function handleSchoolChange(value: string) {
    setSchoolId(value);
    setDepartmentId("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Your admin session has expired. Please sign in again.");
      setSubmitting(false);
      return;
    }

    const name = [firstName, middleName, lastName]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(" ");

    try {
      const response = await fetch(`${API_URL}/hod/students`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email: email.trim(),
          programme_id: Number(programmeId),
          school_id: Number(schoolId),
          department_id: Number(departmentId),
          admission_number: admissionNumber.trim() || null,
          first_name: firstName.trim(),
          middle_name: middleName.trim() || null,
          last_name: lastName.trim(),
          phone: phone.trim() || null,
          date_of_birth: dateOfBirth || null,
          gender: gender || null,
          registration_year: registrationYear.trim(),
          academic_session: academicSession.trim(),
          current_level: currentLevel.trim(),
          current_semester: currentSemester,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const validationErrors = data?.errors
          ? Object.values(data.errors).flat().join(" ")
          : "";

        throw new Error(
          validationErrors ||
            data?.message ||
            "Student account creation failed."
        );
      }

      setSuccess(
        `${data.message} Temporary username: ${
          data.username || "generated automatically"
        }. The permanent registration number will be generated after the first confirmed school-fee payment.`
      );

      setAdmissionNumber("");
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setDateOfBirth("");
      setGender("");
      setProgrammeId("");
      setSchoolId("");
      setDepartmentId("");
      setCurrentLevel("");
      setCurrentSemester("First Semester");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create the student account."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />

      <main>
        <section className="bg-[#102A43] px-5 py-20">
          <SectionTitle
            eyebrow="Administration"
            title="Create Student Account"
            description="Create a student account after admission approval. A temporary login is generated automatically."
          />
        </section>

        <section className="mx-auto max-w-5xl px-5 py-16">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#102A43]">
                Student Account Information
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Complete the approved student&apos;s details. The system
                will generate temporary login credentials and send them
                to the student&apos;s email address.
              </p>
            </div>

            {loadingData && (
              <div className="mb-6 rounded-lg bg-slate-100 p-4 text-sm text-slate-700">
                Loading programmes, schools and departments...
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-700">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h3 className="mb-4 text-lg font-bold text-[#102A43]">
                  Academic Placement
                </h3>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Programme
                    </label>

                    <select
                      required
                      value={programmeId}
                      onChange={(event) =>
                        handleProgrammeChange(event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#102A43]"
                    >
                      <option value="">Select programme</option>

                      {programmes.map((programme) => (
                        <option
                          key={programme.id}
                          value={programme.id}
                        >
                          {programme.name}
                          {programme.short_name
                            ? ` (${programme.short_name})`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      School
                    </label>

                    <select
                      required
                      value={schoolId}
                      onChange={(event) =>
                        handleSchoolChange(event.target.value)
                      }
                      disabled={!programmeId}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none disabled:bg-slate-100 focus:border-[#102A43]"
                    >
                      <option value="">Select school</option>

                      {availableSchools.map((school) => (
                        <option key={school.id} value={school.id}>
                          {school.name}
                          {school.short_name
                            ? ` (${school.short_name})`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Department
                    </label>

                    <select
                      required
                      value={departmentId}
                      onChange={(event) =>
                        setDepartmentId(event.target.value)
                      }
                      disabled={!schoolId}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none disabled:bg-slate-100 focus:border-[#102A43]"
                    >
                      <option value="">Select department</option>

                      {availableDepartments.map((department) => (
                        <option
                          key={department.id}
                          value={department.id}
                        >
                          {department.name}
                          {department.short_name
                            ? ` (${department.short_name})`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Admission Number
                    </label>

                    <input
                      type="text"
                      value={admissionNumber}
                      onChange={(event) =>
                        setAdmissionNumber(event.target.value)
                      }
                      placeholder="Enter admission number"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-bold text-[#102A43]">
                  Student Personal Information
                </h3>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      First Name
                    </label>

                    <input
                      required
                      type="text"
                      value={firstName}
                      onChange={(event) =>
                        setFirstName(event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Middle Name
                    </label>

                    <input
                      type="text"
                      value={middleName}
                      onChange={(event) =>
                        setMiddleName(event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Last Name
                    </label>

                    <input
                      required
                      type="text"
                      value={lastName}
                      onChange={(event) =>
                        setLastName(event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Email Address
                    </label>

                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="student@example.com"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Date of Birth
                    </label>

                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(event) =>
                        setDateOfBirth(event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Gender
                    </label>

                    <select
                      value={gender}
                      onChange={(event) => setGender(event.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#102A43]"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-bold text-[#102A43]">
                  Academic Status
                </h3>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Registration Year
                    </label>

                    <input
                      required
                      type="text"
                      value={registrationYear}
                      onChange={(event) =>
                        setRegistrationYear(event.target.value)
                      }
                      placeholder="2026"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Academic Session
                    </label>

                    <input
                      required
                      type="text"
                      value={academicSession}
                      onChange={(event) =>
                        setAcademicSession(event.target.value)
                      }
                      placeholder="2026/2027"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Current Level
                    </label>

                    <select
                      required
                      value={currentLevel}
                      onChange={(event) =>
                        setCurrentLevel(event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#102A43]"
                    >
                      <option value="">Select level</option>

                      {levelOptions.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Current Semester
                    </label>

                    <select
                      required
                      value={currentSemester}
                      onChange={(event) =>
                        setCurrentSemester(event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#102A43]"
                    >
                      <option value="First Semester">
                        First Semester
                      </option>
                      <option value="Second Semester">
                        Second Semester
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#C9A227] bg-yellow-50 p-5">
                <h3 className="font-bold text-[#102A43]">
                  Registration Number Rule
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-700">
                  No permanent registration number is entered here.
                  The system creates it automatically after the student&apos;s
                  first school-fee payment is successfully confirmed.
                </p>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row">
                <button
                  type="submit"
                  disabled={submitting || loadingData}
                  className="flex-1 rounded-lg bg-[#102A43] px-6 py-3 font-bold text-white hover:bg-[#243B53] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Creating Student Account..."
                    : "Add Student"}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/admin/students")}
                  className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View Student Records
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}