"use client";

import { FormEvent, useState } from "react";

type NewsItem = {
  id: number;
  title: string;
  category: string;
  content: string;
  status: "Published" | "Draft";
};

export default function NewsManagement() {
  const [news, setNews] = useState<NewsItem[]>([
    {
      id: 1,
      title: "COELS Portal",
      category: "General",
      content:
        "Welcome to the official College of Education and Legal Studies portal.",
      status: "Published",
    },
  ]);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [content, setContent] = useState("");
  const [status, setStatus] =
    useState<"Published" | "Draft">("Published");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      setMessage("News title and content are required.");
      return;
    }

    const newNews: NewsItem = {
      id: Date.now(),
      title,
      category,
      content,
      status,
    };

    setNews((current) => [...current, newNews]);

    setTitle("");
    setCategory("General");
    setContent("");
    setStatus("Published");

    setMessage("News article created successfully.");
  }

  function toggleStatus(id: number) {
    setNews((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === "Published"
                  ? "Draft"
                  : "Published",
            }
          : item
      )
    );
  }

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          Create News Article
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Create official news articles for publication on the public COELS
          website.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 grid gap-5"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              News Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter news title"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Category
              </label>

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3"
              >
                <option>General</option>
                <option>Admissions</option>
                <option>Academic</option>
                <option>Examinations</option>
                <option>Events</option>
                <option>Announcements</option>
                <option>Consultancy</option>
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

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              News Content
            </label>

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Enter news content"
              rows={7}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#102A43]"
            />
          </div>

          <button
            type="submit"
            className="w-fit rounded-lg bg-[#102A43] px-6 py-3 font-semibold text-white hover:bg-[#243B53]"
          >
            Create News Article
          </button>
        </form>

        {message && (
          <p className="mt-4 rounded-lg bg-slate-100 px-4 py-3 text-sm font-medium text-[#102A43]">
            {message}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-[#102A43]">
          News Records
        </h2>

        <div className="mt-6 space-y-5">
          {news.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-slate-200 p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#C9A227]">
                    {item.category}
                  </div>

                  <h3 className="mt-1 text-xl font-bold text-[#102A43]">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {item.content}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleStatus(item.id)}
                  className="rounded-lg border border-[#102A43] px-4 py-2 text-xs font-semibold text-[#102A43]"
                >
                  {item.status === "Published"
                    ? "Unpublish"
                    : "Publish"}
                </button>
              </div>

              <div className="mt-4 text-xs font-semibold text-slate-500">
                Status: {item.status}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-bold text-[#102A43]">
          News Management Rules
        </h2>

        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
          <li>• Authorised administrators can create news articles.</li>
          <li>• News can be saved as a draft before publication.</li>
          <li>• Published news appears on the public COELS website.</li>
          <li>• Administrators can publish or unpublish news.</li>
          <li>• News can be organised by category.</li>
          <li>• Consultancy-related news can be identified separately.</li>
          <li>• Backend editing, deletion and publication dates will be added later.</li>
        </ul>
      </div>
    </section>
  );
}