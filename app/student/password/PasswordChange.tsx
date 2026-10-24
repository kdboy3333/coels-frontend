"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://127.0.0.1:8000/api";

export default function PasswordChange() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("The new password must contain at least 8 characters.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The new password confirmation does not match.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/portal");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/change-password`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
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
            "Password change failed."
        );
      }

      const storedUser = localStorage.getItem("coels_user");

      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);

          localStorage.setItem(
            "coels_user",
            JSON.stringify({
              ...user,
              must_change_password: false,
            })
          );
        } catch {
          // Ignore malformed cached user data.
        }
      }

      setMessage(
        "Password changed successfully. Redirecting to your student dashboard..."
      );

      setTimeout(() => {
        router.push("/student");
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to change your password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-[#102A43]">
        Set Your Permanent Password
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        Your temporary password must be replaced before you can
        access student services.
      </p>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-700">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-7 space-y-5"
      >
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Temporary Password
          </label>

          <input
            required
            type="password"
            value={currentPassword}
            onChange={(event) =>
              setCurrentPassword(event.target.value)
            }
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            New Password
          </label>

          <input
            required
            type="password"
            value={newPassword}
            onChange={(event) =>
              setNewPassword(event.target.value)
            }
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
          />

          <p className="mt-1 text-xs text-slate-500">
            Minimum 8 characters.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Confirm New Password
          </label>

          <input
            required
            type="password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#102A43] px-6 py-3 font-bold text-white hover:bg-[#243B53] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Changing Password..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}