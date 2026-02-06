"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type {
  User,
  PracticeSession,
  DashboardData,
} from "@/types/index";

// ─── Helpers ───

function userDoc(userId: string) {
  return doc(getFirebaseDb(), "users", userId);
}

function sessionsCollection(userId: string) {
  return collection(getFirebaseDb(), "users", userId, "practiceSessions");
}

function recordingsCollection(userId: string) {
  return collection(getFirebaseDb(), "users", userId, "recordings");
}

function tempoAttemptsCollection(userId: string) {
  return collection(getFirebaseDb(), "users", userId, "tempoAttempts");
}

function sevenDaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().split("T")[0];
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── Dashboard Data Fetcher ───

export async function getDashboardData(
  userId: string
): Promise<DashboardData> {
  const cutoff = sevenDaysAgo();
  const today = todayStr();

  // Fetch in parallel
  const [userSnap, sessionsSnap, recordingsSnap, tempoSnap] = await Promise.all(
    [
      // 1. User document
      getDoc(userDoc(userId)),

      // 2. Recent practice sessions (last 7 days, by date field)
      getDocs(
        query(
          sessionsCollection(userId),
          where("date", ">=", cutoff),
          orderBy("date", "desc"),
          limit(50)
        )
      ),

      // 3. Recent recordings (last 7 days — query by createdAt)
      getDocs(
        query(
          recordingsCollection(userId),
          orderBy("createdAt", "desc"),
          limit(50)
        )
      ),

      // 4. Recent tempo attempts
      getDocs(
        query(
          tempoAttemptsCollection(userId),
          where("date", ">=", cutoff),
          orderBy("date", "desc"),
          limit(50)
        )
      ),
    ]
  );

  // Parse user
  const user = userSnap.exists()
    ? ({ id: userSnap.id, ...userSnap.data() } as User)
    : null;

  // Parse sessions
  const recentSessions = sessionsSnap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as PracticeSession
  );

  // Filter recordings to last 7 days client-side (createdAt is a Timestamp)
  const cutoffDate = new Date(cutoff);
  const recentRecordingsCount = recordingsSnap.docs.filter((d) => {
    const data = d.data();
    if (!data.createdAt) return false;
    const ts = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
    return ts >= cutoffDate;
  }).length;

  // Tempo attempts count
  const recentTempoAttempts = tempoSnap.docs.length;

  // Today's session
  const todaySession =
    recentSessions.find((s) => s.date === today) ?? null;

  // Streak and minutes from user document (pre-aggregated)
  const currentStreak = user?.streakDays ?? 0;
  const totalMinutes = user?.totalPracticeMinutes ?? 0;

  // Weekly minutes: sum durationMinutes from recent sessions
  const weeklyMinutes = recentSessions.reduce(
    (sum, s) => sum + (s.durationMinutes ?? 0),
    0
  );

  return {
    user,
    recentSessions,
    recentRecordingsCount,
    recentTempoAttempts,
    todaySession,
    currentStreak,
    totalMinutes,
    weeklyMinutes,
  };
}
