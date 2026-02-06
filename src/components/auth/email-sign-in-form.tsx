"use client";

import { useCallback, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  AuthError,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { ensureUserDocument } from "@/lib/user-service";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

type Mode = "sign-in" | "sign-up";

const inputClassName =
  "w-full rounded-md border border-surface-600 bg-surface-700 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-400 focus:outline-none focus:ring-1 focus:ring-accent-400";

export function EmailSignInForm() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleMode = useCallback(() => {
    setMode((m) => (m === "sign-in" ? "sign-up" : "sign-in"));
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      // Validation
      if (!email || !password) {
        setError("Please fill in all fields.");
        return;
      }
      if (mode === "sign-up" && !displayName.trim()) {
        setError("Please enter your name.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }

      setLoading(true);

      try {
        const auth = getFirebaseAuth();
        if (!auth) {
          throw new Error(
            "Firebase is not configured. Check your environment variables."
          );
        }

        if (mode === "sign-up") {
          // Create account
          const result = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

          // Set display name on the Firebase user profile
          await updateProfile(result.user, {
            displayName: displayName.trim(),
          });

          // Set auth cookie
          const idToken = await result.user.getIdToken();
          const response = await fetch("/api/login", {
            method: "GET",
            headers: { Authorization: `Bearer ${idToken}` },
          });
          if (!response.ok) {
            throw new Error("Failed to establish session. Please try again.");
          }

          // Create Firestore user document
          await ensureUserDocument(
            result.user.uid,
            displayName.trim(),
            email,
            null
          );

          sessionStorage.removeItem("me_cookie_attempt");
          window.location.href = "/dashboard";
        } else {
          // Sign in
          const result = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );

          // Set auth cookie
          const idToken = await result.user.getIdToken();
          const response = await fetch("/api/login", {
            method: "GET",
            headers: { Authorization: `Bearer ${idToken}` },
          });
          if (!response.ok) {
            throw new Error("Failed to establish session. Please try again.");
          }

          // Update Firestore user document (lastLogin)
          await ensureUserDocument(
            result.user.uid,
            result.user.displayName,
            result.user.email,
            result.user.photoURL
          );

          sessionStorage.removeItem("me_cookie_attempt");
          window.location.href = "/dashboard";
        }
      } catch (err) {
        const authErr = err as AuthError;
        switch (authErr.code) {
          case "auth/email-already-in-use":
            setError(
              "An account with this email already exists. Try signing in with Google instead."
            );
            break;
          case "auth/invalid-email":
            setError("Please enter a valid email address.");
            break;
          case "auth/user-not-found":
          case "auth/wrong-password":
          case "auth/invalid-credential":
            setError("Invalid email or password.");
            break;
          case "auth/too-many-requests":
            setError(
              "Too many failed attempts. Please try again in a few minutes."
            );
            break;
          default:
            setError(
              err instanceof Error
                ? err.message
                : "Something went wrong. Please try again."
            );
        }
        setLoading(false);
      }
    },
    [email, password, displayName, mode]
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {mode === "sign-up" && (
        <input
          type="text"
          placeholder="Your name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className={inputClassName}
          autoComplete="name"
        />
      )}

      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputClassName}
        autoComplete="email"
      />

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClassName}
          autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-sm text-red-400">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-accent-500 text-surface-900 hover:bg-accent-400"
        size="lg"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-surface-900 border-t-transparent" />
            {mode === "sign-up" ? "Creating account..." : "Signing in..."}
          </span>
        ) : mode === "sign-up" ? (
          "Create account"
        ) : (
          "Sign in with email"
        )}
      </Button>

      <p className="text-center text-sm text-text-muted">
        {mode === "sign-in" ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={toggleMode}
              className="text-accent-400 hover:text-accent-300"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={toggleMode}
              className="text-accent-400 hover:text-accent-300"
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </form>
  );
}
