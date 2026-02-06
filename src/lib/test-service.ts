"use client";

import {
  collection,
  addDoc,
  query,
  orderBy,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { updateSkillScore } from "@/lib/progress-service";
import { logActivity } from "@/lib/activity-service";
import type { TestAttempt, TestError, SkillType } from "@/types/index";

// ─── Collection Path Helper ───

function attemptsCollection(userId: string) {
  return collection(getFirebaseDb(), "users", userId, "testAttempts");
}

// ─── Save Test Attempt ───

export interface SaveTestAttemptData {
  testId: string;
  testTitle: string;
  levelId: string;
  score: number;
  totalQuestions: number;
  errors: TestError[];
}

export async function saveTestAttempt(
  userId: string,
  data: SaveTestAttemptData,
  userDisplayName?: string,
  userPhotoURL?: string | null
): Promise<string> {
  const docRef = await addDoc(attemptsCollection(userId), {
    userId,
    testId: data.testId,
    testTitle: data.testTitle,
    levelId: data.levelId,
    score: data.score,
    totalQuestions: data.totalQuestions,
    errors: data.errors,
    completedAt: serverTimestamp(),
  });

  // Log activity event (non-critical)
  try {
    await logActivity(userId, {
      type: "test_completed",
      title: `Completed test: ${data.testTitle} (${data.score}/${data.totalQuestions})`,
      metadata: {
        testId: data.testId,
        score: String(data.score),
        total: String(data.totalQuestions),
      },
      userDisplayName: userDisplayName ?? "User",
      userPhotoURL: userPhotoURL ?? null,
    });
  } catch (err) {
    console.error("Failed to log test activity:", err);
  }

  return docRef.id;
}

// ─── Get Test Attempts ───

export async function getTestAttempts(
  userId: string,
  testId?: string
): Promise<TestAttempt[]> {
  const col = attemptsCollection(userId);
  const q = testId
    ? query(col, where("testId", "==", testId), orderBy("completedAt", "desc"))
    : query(col, orderBy("completedAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as TestAttempt);
}

// ─── Update Progress From Test ───

/** Maps test categories to SkillType for progress updates */
const CATEGORY_TO_SKILL: Record<string, SkillType> = {
  intervals: "intervals",
  fretboard: "fretboard",
  scales: "fretboard",
  chords: "chords",
  ear: "ear",
};

export async function updateProgressFromTest(
  userId: string,
  category: string,
  score: number,
  totalQuestions: number
): Promise<void> {
  const skillType = CATEGORY_TO_SKILL[category];
  if (!skillType) return;

  // Score as a fraction 0..1, weighted average with 0.6 toward new score
  const newScore = totalQuestions > 0 ? score / totalQuestions : 0;
  const weightedScore = Math.round(newScore * 100) / 100;

  await updateSkillScore(userId, skillType, weightedScore);
}
