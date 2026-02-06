"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  error: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolved = useRef(false);

  useEffect(() => {
    // Safety timeout — if auth hasn't resolved in 10s, stop loading
    const timeout = setTimeout(() => {
      if (!resolved.current) {
        console.warn("Auth state did not resolve within 10 seconds.");
        setError("Auth timed out. Please refresh the page.");
        setLoading(false);
      }
    }, 10_000);

    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        resolved.current = true;
        setLoading(false);
        clearTimeout(timeout);
        return;
      }
      const unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser) => {
          resolved.current = true;
          setUser(firebaseUser);
          setLoading(false);
          setError(null);
          clearTimeout(timeout);
        },
        (err) => {
          resolved.current = true;
          console.error("Auth state listener error:", err);
          setError(err.message);
          setLoading(false);
          clearTimeout(timeout);
        }
      );

      return () => {
        unsubscribe();
        clearTimeout(timeout);
      };
    } catch (err) {
      resolved.current = true;
      console.error("Firebase auth initialization error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to initialize auth."
      );
      setLoading(false);
      clearTimeout(timeout);
    }
  }, []);

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    await firebaseSignOut(auth);
    await fetch("/api/logout");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
