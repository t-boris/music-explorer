"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Music } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignInButton } from "@/components/auth/sign-in-button";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && user && !redirecting) {
      setRedirecting(true);
      router.push("/dashboard");
    }
  }, [user, loading, router, redirecting]);

  if (loading || redirecting) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-text-secondary">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <Card className="w-full max-w-sm border-surface-700 bg-surface-800">
        <CardHeader className="items-center text-center">
          <Music className="mb-2 h-10 w-10 text-accent-400" />
          <CardTitle className="font-heading text-2xl text-text-primary">
            Music Explorer
          </CardTitle>
          <CardDescription className="text-text-secondary">
            Sign in to track your progress
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SignInButton />

          <div className="mt-2 text-center">
            <Link
              href="/levels"
              className="text-sm text-text-muted transition-colors hover:text-accent-400"
            >
              Or continue browsing
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
