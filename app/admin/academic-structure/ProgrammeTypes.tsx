"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiUrl } from "../../../lib/api";

type Programme = {
  id: number;
  name: string;
  short_name?: string | null;
  is_active?: boolean | number | null;
};

export default function ProgrammeTypes() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProgrammes() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(apiUrl("programmes"), {
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `Could not load programmes (HTTP ${response.status}).`,
          );
        }

        const data: unknown = await response.json();

        let records: Programme[];

        if (Array.isArray(data)) {
          records = data as Programme[];
        } else if (
          data &&
          typeof data === "object" &&
          "programmes" in data &&
          Array.isArray(data.programmes)
        ) {
          records = data.programmes as Programme[];
        } else {
          throw new Error("The API returned an unexpected programme list.");
        }

        if (!cancelled) {
          setProgrammes(records);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load programmes from the server.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProgrammes();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-extrabold text-[#102A43]">
        Programmes
      </h2>

      <p className="mt-3 text-slate-600">
        These records are loaded from the COELS database.
      </p>

      {loading && (
        <p className="mt-5 text-slate-600">Loading programmes...</p>
      )}

      {!loading && error && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-700">
            Unable to load programmes
          </p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 rounded-lg bg-[#102A43] px-4 py-2 text-sm font-bold text-white"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && programmes.length === 0 && (
        <p className="mt-5 rounded-lg bg-slate-50 p-4 text-slate-600">
          No programmes have been created yet. Add one through Programme
          Management.
        </p>
      )}

      {!loading && !error && programmes.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {programmes.map((programme) => (
            <div
              key={programme.id}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <p className="font-bold text-[#102A43]">
                {programme.name}
              </p>
              {programme.short_name && (
                <p className="mt-1 text-sm text-slate-600">
                  Short name: {programme.short_name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <Link
        href="/admin/programmes"
        className="mt-6 inline-block rounded-lg bg-[#102A43] px-5 py-3 text-sm font-bold text-white hover:bg-[#243f5a]"
      >
        Open Programme Management
      </Link>
    </section>
  );
}