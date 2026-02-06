import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Progress | Music Explorer",
  description: "Track your skill progression, test scores, and practice streaks.",
  robots: "noindex",
};

export default function ProgressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
