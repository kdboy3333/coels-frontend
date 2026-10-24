"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "../../lib/api";

type LoginResponse = {
  message?: string;
  must_change_password?: boolean;
  user: {
    id: number;
    name: string;
    username: string | null;
    email: string;
    role: string;
    is_active: boolean;
    must_change_password?: boolean;
  };
  token: string;
};

type ApiError = {
  message?: string;
};

export default function LoginForm() {
  const router = useRouter();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(apiUrl("login"), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: login.trim(),
          password,
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const apiError = data as ApiError;
        throw new Error(apiError.message || "Login failed.");
      }

      const loginData = data as LoginResponse;

      if (!loginData.token || !loginData.user?.role) {
        throw new Error("The server returned an invalid login response.");
      }

      localStorage.setItem("token", loginData.token);
      localStorage.setItem("coels_token", loginData.token);
      localStorage.setItem("coels_user", JSON.stringify(loginData.user));
      localStorage.setItem("coels_role", loginData.user.role);

      setMessage("Login successful. Redirecting...");

      const mustChangePassword =
        loginData.must_change_password ??
        loginData.user.must_change_password ??
        false;

      switch (loginData.user.role) {
        case "student":
          router.replace(
            mustChangePassword ? "/student/password" : "/student",
          );
          break;

        case "super_admin":
          router.replace("/admin");
          break;

        case "hod":
          router.replace("/staff");
          break;

        default:
          router.replace("/portal");
          break;
      }
    } catch (err) {
      if (err instanceof TypeError) {
        setError(
          "Unable to connect to the COELS server. Check that the backend is running.",
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#C9A227]">
        Secure Access
      </p>

      <h2 className="mt-2 text-2xl font-extrabold text-[#102A43]">
        Sign In
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        Sign in using your COELS username or email address.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <div>
          <label
            htmlFor="login"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Username or Email
          </label>

          <input
            id="login"
            required
            type="text"
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            placeholder="Enter username or email"
            autoComplete="username"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Password
          </label>

          <input
            id="password"
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#102A43] px-6 py-3 font-bold text-white hover:bg-[#243B53] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <p className="text-center text-sm text-slate-600">
          Forgot your password? Contact your COELS administrator for assistance.
        </p>

        {message && (
          <div
            role="status"
            className="rounded-lg bg-green-50 p-4 text-sm leading-6 text-green-700"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 p-4 text-sm leading-6 text-red-700"
          >
            {error}
          </div>
        )}
      </form>
    </div>
  );
}