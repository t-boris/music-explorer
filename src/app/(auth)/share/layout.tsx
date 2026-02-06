import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Share Settings | Music Explorer",
  description: "Manage your invite link and connections.",
  robots: "noindex",
};

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
