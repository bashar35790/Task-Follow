import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task-Flow | Personal Task Manager",
  description: "A fast, responsive full-stack task manager built for Acme AI Fellowship",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
