"use client";

import { useEffect, useRef, useState } from "react";
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
import { EmailSignInForm } from "@/components/auth/email-sign-in-form";
import { useAuth } from "@/hooks/use-auth";

const COOKIE_ATTEMPT_KEY = "me_cookie_attempt";

export default function LoginPage() {
  const { user, loading, error: authError } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const attempted = useRef(false);

  useEffect(() => {
    if (!loading && user && !redirecting && !attempted.current) {
      // Prevent cross-page-load loops: if we already tried setting the cookie
      // in this browser session and ended up back here, the cookie isn't sticking.
      const prevAttempts = parseInt(
        sessionStorage.getItem(COOKIE_ATTEMPT_KEY) || "0",
        10
      );
      if (prevAttempts >= 1) {
        sessionStorage.removeItem(COOKIE_ATTEMPT_KEY);
        setLoginError(
          "Unable to establish a session. Please sign out and sign in again."
        );
        return;
      }

      attempted.current = true;
      setRedirecting(true);
      sessionStorage.setItem(COOKIE_ATTEMPT_KEY, String(prevAttempts + 1));

      // User is authenticated client-side (Firebase Auth / IndexedDB) but
      // may not have a server cookie (expired, mobile redirect return, etc.).
      // Establish the cookie before redirecting so middleware allows access.
      (async () => {
        try {
          const idToken = await user.getIdToken();

          // Set auth cookie via API route
          const response = await fetch("/api/login", {
            method: "GET",
            headers: { Authorization: `Bearer ${idToken}` },
          });

          if (!response.ok) {
            const body = await response.text().catch(() => "");
            throw new Error(
              `Session setup failed (${response.status}). ${body}`
            );
          }

          // Cookie set successfully — redirect.
          // Clear the attempt flag AFTER a short delay so the dashboard page
          // has time to load; if middleware rejects, we'll land back here
          // with the flag still set and break the loop.
          const params = new URLSearchParams(window.location.search);
          const dest = params.get("redirect") || "/dashboard";
          window.location.href = dest;
        } catch (err) {
          sessionStorage.removeItem(COOKIE_ATTEMPT_KEY);
          setRedirecting(false);
          setLoginError(
            err instanceof Error ? err.message : "Failed to complete sign-in."
          );
        }
      })();
    }
  }, [user, loading, redirecting]);

  if (loading || redirecting) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-text-secondary">
          {redirecting ? "Signing you in..." : "Loading..."}
        </p>
      </main>
    );
  }

  const displayError = loginError || authError;

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
          {displayError && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-sm text-red-400">
              {displayError}
            </p>
          )}
          <EmailSignInForm />

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-600" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface-800 px-2 text-text-muted">or</span>
            </div>
          </div>

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
