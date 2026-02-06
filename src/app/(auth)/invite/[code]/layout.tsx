import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accept Invite | Music Explorer",
  description: "Accept an invite to connect with another musician.",
  robots: "noindex",
};

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
