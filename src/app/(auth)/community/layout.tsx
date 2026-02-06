import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community | Music Explorer",
  description: "Connect with other musicians and see their activity.",
  robots: "noindex",
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
