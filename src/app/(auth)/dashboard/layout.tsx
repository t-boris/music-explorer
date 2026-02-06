import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Music Explorer",
  description: "Your personal practice dashboard.",
  robots: "noindex",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
