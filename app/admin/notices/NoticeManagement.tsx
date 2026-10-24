"use client";

import { FormEvent, useState } from "react";

type Notice = {
  id: number;
  title: string;
  message: string;
  audience: string;
  status: "Published" | "Draft";
};

export default function NoticeManagement() {
  const [notices, setNotices] = useState<Notice[]>([
    {
      id: 1,
      title: "Welcome to COELS",
      message: "Welcome to the College of Education and Legal Studies portal.",
      audience: "All Users",
      status: "Published",
    },
  ]);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("All Users");
  const [status, setStatus] = useState<"Published" | "Draft">("Published");
  const [feedback, setFeedback] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !message.trim()) {
      setFeedback("Notice title and message are required.");
      return;
    }

    const newNotice: Notice = {
      id: Date.now(),
      title,
      message,
      audience,
      status,
    };

    setNotices((current) => [...current, newNotice]);

    setTitle("");
    setMessage("");
    setAudience("All Users");
    setStatus("Published");

    setFeedback("Notice created successfully.");
  }

  function toggleStatus(id: number) {
    setNotices((current) =>
      current.map((notice) =>
        notice.id === id
          ? {
              ...notice,
              status:
                notice.status === "Published"
                  ? "Draft"
                  : "Published",
            }
          : notice
      )
    );
  }

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Create Notice
        </h2>

        <form
          onSubmit={handleSubmit}
          className="mt-6 grid gap-5"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Notice Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter notice title"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Notice Message
            </label>

            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Enter notice message"
              rows={5}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Audience
              </label>

              <select
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3"
              >
                <option>All Users</option>
                <option>Applicants</option>
                <option>Students</option>
                <option>Lecturers</option>
                <option>HODs</option>
                <option>Registry Staff</option>
                <option>Bursary Staff</option>
                <option>Administrators</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as "Published" | "Draft"
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3"
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-fit rounded-lg bg-[#102A43] px-6 py-3 font-semibold text-white hover:bg-[#243B53]"
          >
            Create Notice
          </button>
        </form>

        {feedback && (
          <p className="mt-4 rounded-lg bg-slate-100 px-4 py-3 text-sm font-medium text-[#102A43]">
            {feedback}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Notice Records
        </h2>

        <div className="mt-6 space-y-4">
          {notices.map((notice) => (
            <article
              key={notice.id}
              className="rounded-xl border border-slate-200 p-5"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#102A43]">
                    {notice.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {notice.message}
                  </p>

                  <div className="mt-3 text-xs font-semibold text-slate-500">
                    Audience: {notice.audience}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleStatus(notice.id)}
                  className="rounded-lg border border-[#102A43] px-4 py-2 text-xs font-semibold text-[#102A43]"
                >
                  {notice.status === "Published"
                    ? "Unpublish"
                    : "Publish"}
                </button>
              </div>

              <div className="mt-4 text-xs font-semibold text-slate-500">
                Status: {notice.status}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-bold text-[#102A43]">
          Notification Rules
        </h2>

        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
          <li>• Administrators can create and publish notices.</li>
          <li>• Notices can target specific user groups.</li>
          <li>• Draft notices are not publicly published.</li>
          <li>• Published notices can be unpublished.</li>
          <li>• Student notifications can later be connected to the student portal.</li>
          <li>• Staff notifications can later be connected to authorised staff portals.</li>
          <li>• Important account and payment notifications will be generated by the backend.</li>
        </ul>
      </div>
    </section>
  );
}