"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { PracticeSession } from "@/types/index";

interface UsePracticeSessionsResult {
  sessions: PracticeSession[];
  loading: boolean;
  error: string | null;
}

export function usePracticeSessions(
  userId: string | undefined
): UsePracticeSessionsResult {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setSessions([]);
      setLoading(false);
      return;
    }

    const col = collection(
      getFirebaseDb(),
      "users",
      userId,
      "practiceSessions"
    );
    const q = query(col, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as PracticeSession[];
        setSessions(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Practice sessions snapshot error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  return { sessions, loading, error };
}
