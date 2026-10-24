import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "COELS | College of Education and Legal Studies",
  description:
    "Official portal of the College of Education and Legal Studies, Nguru, Yobe State.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}