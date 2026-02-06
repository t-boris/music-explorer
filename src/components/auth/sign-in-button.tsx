"use client";

import { useCallback, useEffect, useState } from "react";
import {
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { ensureUserDocument } from "@/lib/user-service";
import { Button } from "@/components/ui/button";

function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function SignInButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(isMobile());
  }, []);

  const handleSignIn = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();

      const auth = getFirebaseAuth();

      if (mobile) {
        // Mobile: use redirect flow to avoid popup blocking
        await signInWithRedirect(auth, provider);
        // Redirect flow navigates away, loading state handled by page reload
        return;
      }

      // Desktop: use popup flow
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // Ensure user document exists in Firestore
      const { uid, displayName, email, photoURL } = result.user;
      await ensureUserDocument(uid, displayName, email, photoURL);

      // Set auth cookie via API route
      await fetch("/api/login", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Sign in failed. Please try again.";
      setError(message);
      setLoading(false);
    }
  }, [mobile]);

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleSignIn}
        disabled={loading}
        className="w-full bg-accent-500 text-surface-900 hover:bg-accent-400"
        size="lg"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-surface-900 border-t-transparent" />
            Signing in...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <GoogleIcon />
            Sign in with Google
          </span>
        )}
      </Button>

      {error && (
        <p className="text-center text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
