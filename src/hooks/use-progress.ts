"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { getSessionHistory } from "@/lib/progress-service";
import type { User, PracticeSession, ProgressSummary } from "@/types/index";

interface UseProgressResult {
  progressSummary: ProgressSummary | null;
  currentLevel: number;
  sessions: PracticeSession[];
  loading: boolean;
  error: string | null;
}

export function useProgress(): UseProgressResult {
  const { user } = useAuth();
  const [progressSummary, setProgressSummary] =
    useState<ProgressSummary | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time listener on user doc for progressSummary
  useEffect(() => {
    if (!user?.uid) {
      setProgressSummary(null);
      setCurrentLevel(0);
      setLoading(false);
      return;
    }

    let userRef;
    try {
      userRef = doc(getFirebaseDb(), "users", user.uid);
    } catch (err) {
      console.error("Progress init error:", err);
      setError(err instanceof Error ? err.message : "Failed to connect to database.");
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as User;
          setProgressSummary(data.progressSummary ?? null);
          setCurrentLevel(data.currentLevel ?? 0);
        } else {
          setProgressSummary(null);
          setCurrentLevel(0);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Progress snapshot error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user?.uid]);

  // Fetch session history
  useEffect(() => {
    if (!user?.uid) {
      setSessions([]);
      return;
    }

    let cancelled = false;

    getSessionHistory(user.uid, 30)
      .then((data) => {
        if (!cancelled) setSessions(data);
      })
      .catch((err) => {
        console.error("Session history fetch error:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  return { progressSummary, currentLevel, sessions, loading, error };
}
