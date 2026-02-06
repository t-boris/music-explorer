"use client";

import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { PracticeSession } from "@/types/index";

// ─── Collection Path Helper ───

function sessionsCollection(userId: string) {
  return collection(getFirebaseDb(), "users", userId, "practiceSessions");
}

function sessionDoc(userId: string, sessionId: string) {
  return doc(getFirebaseDb(), "users", userId, "practiceSessions", sessionId);
}

// ─── Create ───

export interface CreatePracticeSessionData {
  date: string;
  durationMinutes: number;
  notes: string;
  exerciseIds: string[];
  levelId: string;
}

export async function createPracticeSession(
  userId: string,
  data: CreatePracticeSessionData
): Promise<string> {
  const docRef = await addDoc(sessionsCollection(userId), {
    userId,
    date: data.date,
    durationMinutes: data.durationMinutes,
    notes: data.notes,
    exerciseIds: data.exerciseIds,
    levelId: data.levelId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// ─── Read (list) ───

export async function getPracticeSessions(
  userId: string
): Promise<PracticeSession[]> {
  const q = query(
    sessionsCollection(userId),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as PracticeSession[];
}

// ─── Read (single) ───

export async function getPracticeSession(
  userId: string,
  sessionId: string
): Promise<PracticeSession | null> {
  const snap = await getDoc(sessionDoc(userId, sessionId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as PracticeSession;
}

// ─── Update ───

export async function updatePracticeSession(
  userId: string,
  sessionId: string,
  data: Partial<CreatePracticeSessionData>
): Promise<void> {
  await updateDoc(sessionDoc(userId, sessionId), data);
}

// ─── Delete ───

export async function deletePracticeSession(
  userId: string,
  sessionId: string
): Promise<void> {
  await deleteDoc(sessionDoc(userId, sessionId));
}
