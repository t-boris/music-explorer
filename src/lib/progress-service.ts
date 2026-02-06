"use client";

import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type {
  User,
  SkillType,
  ProgressEntry,
  PracticeSession,
} from "@/types/index";

// --- User Progress Data ---

export async function getProgressData(
  userId: string
): Promise<{ progressSummary: User["progressSummary"]; currentLevel: number } | null> {
  const userDoc = await getDoc(doc(getFirebaseDb(), "users", userId));
  if (!userDoc.exists()) return null;
  const data = userDoc.data() as User;
  return {
    progressSummary: data.progressSummary,
    currentLevel: data.currentLevel,
  };
}

// --- Detailed Progress (drill-down by skill) ---

export async function getDetailedProgress(
  userId: string,
  skillType: SkillType
): Promise<ProgressEntry[]> {
  const col = collection(getFirebaseDb(), "users", userId, "progress");
  const q = query(col, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }) as ProgressEntry)
    .filter((entry) => entry.skillType === skillType);
}

// --- Session History ---

export async function getSessionHistory(
  userId: string,
  count: number = 30
): Promise<PracticeSession[]> {
  const col = collection(getFirebaseDb(), "users", userId, "practiceSessions");
  const q = query(col, orderBy("createdAt", "desc"), firestoreLimit(count));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as PracticeSession[];
}

// --- Update Skill Score ---

export async function updateSkillScore(
  userId: string,
  skillType: SkillType,
  score: number
): Promise<void> {
  const userRef = doc(getFirebaseDb(), "users", userId);
  await updateDoc(userRef, {
    [`progressSummary.${skillType}.score`]: score,
    [`progressSummary.${skillType}.lastUpdated`]: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// --- Create Progress Entry ---

export interface CreateProgressEntryData {
  skillType: SkillType;
  levelId: string;
  score: number;
  source: ProgressEntry["source"];
  sourceId: string;
}

export async function createProgressEntry(
  userId: string,
  data: CreateProgressEntryData
): Promise<string> {
  const col = collection(getFirebaseDb(), "users", userId, "progress");
  const docRef = await addDoc(col, {
    userId,
    skillType: data.skillType,
    levelId: data.levelId,
    score: data.score,
    source: data.source,
    sourceId: data.sourceId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
