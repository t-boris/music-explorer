"use client";

import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { TempoAttempt } from "@/types/index";

// ─── Collection Path Helper ───

function attemptsCollection(userId: string) {
  return collection(getFirebaseDb(), "users", userId, "tempoAttempts");
}

// ─── Log Attempt ───

export interface LogTempoAttemptData {
  exerciseId: string;
  exerciseTitle: string;
  startBpm: number;
  targetBpm: number;
  achievedBpm: number;
  date: string;
}

export async function logTempoAttempt(
  userId: string,
  data: LogTempoAttemptData
): Promise<string> {
  const docRef = await addDoc(attemptsCollection(userId), {
    userId,
    exerciseId: data.exerciseId,
    exerciseTitle: data.exerciseTitle,
    startBpm: data.startBpm,
    targetBpm: data.targetBpm,
    achievedBpm: data.achievedBpm,
    date: data.date,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// ─── Get History ───

export async function getTempoHistory(
  userId: string,
  exerciseId: string
): Promise<TempoAttempt[]> {
  const q = query(attemptsCollection(userId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }) as TempoAttempt)
    .filter((a) => a.exerciseId === exerciseId);
}
