import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Practice | Music Explorer",
  description: "Log practice sessions, record audio, and train with tools.",
  robots: "noindex",
};

export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
