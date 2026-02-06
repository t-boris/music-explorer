import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Music Explorer",
  description: "Sign in to track your guitar learning progress.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
