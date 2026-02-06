"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  type QueryConstraint,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { Recording } from "@/types/index";

interface UseRecordingsResult {
  recordings: Recording[];
  loading: boolean;
  error: string | null;
}

/**
 * Real-time hook for recording list.
 * Optionally filter by contextType and/or contextId.
 */
export function useRecordings(
  userId: string | undefined,
  contextType?: Recording["contextType"],
  contextId?: string
): UseRecordingsResult {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setRecordings([]);
      setLoading(false);
      return;
    }

    const col = collection(getFirebaseDb(), "users", userId, "recordings");

    const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
    if (contextType) {
      constraints.unshift(where("contextType", "==", contextType));
    }
    if (contextId) {
      constraints.unshift(where("contextId", "==", contextId));
    }

    const q = query(col, ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Recording[];
        setRecordings(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Recordings snapshot error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId, contextType, contextId]);

  return { recordings, loading, error };
}

/**
 * Real-time hook for recordings filtered by sessionId.
 */
export function useSessionRecordings(
  userId: string | undefined,
  sessionId: string | undefined
): UseRecordingsResult {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !sessionId) {
      setRecordings([]);
      setLoading(false);
      return;
    }

    const col = collection(getFirebaseDb(), "users", userId, "recordings");
    const q = query(
      col,
      where("sessionId", "==", sessionId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Recording[];
        setRecordings(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Session recordings snapshot error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId, sessionId]);

  return { recordings, loading, error };
}
