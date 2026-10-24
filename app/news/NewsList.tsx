import NewsCard from "./NewsCard";

const news = [
  {
    title: "COELS Admission Information",
    date: "2025/2026 Academic Session",
    description:
      "Important information for prospective applicants seeking admission into COELS programmes.",
  },
  {
    title: "Academic Session Information",
    date: "2025/2026 Academic Session",
    description:
      "Students and applicants should follow official College announcements concerning the academic session.",
  },
  {
    title: "Consultancy Services",
    date: "2025/2026 Academic Session",
    description:
      "COELS Innovations and Consultancy Services provides professional diploma and certificate programmes.",
  },
];

export default function NewsList() {
  return (
    <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
      {news.map((item) => (
        <NewsCard
          key={item.title}
          title={item.title}
          date={item.date}
          description={item.description}
        />
      ))}
    </div>
  );
}