"use client";

import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { logActivity } from "@/lib/activity-service";
import { emitGamificationEvent } from "@/lib/gamification-service";
import { getCompletionsForLesson } from "@/lib/exercise-service";
import type { LessonProgress, User } from "@/types/index";

// ─── Collection / Doc Helpers ───

function progressCollection(userId: string) {
  return collection(getFirebaseDb(), "users", userId, "lessonProgress");
}

function progressDocRef(userId: string, levelId: string, lessonId: string) {
  return doc(getFirebaseDb(), "users", userId, "lessonProgress", `${levelId}_${lessonId}`);
}

// ─── Mark Content Read ───

export async function markContentRead(
  userId: string,
  levelId: string,
  lessonId: string
): Promise<void> {
  const ref = progressDocRef(userId, levelId, lessonId);
  await setDoc(
    ref,
    {
      lessonId,
      levelId,
      contentReadAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// ─── Query Helpers ───

export async function getLessonProgress(
  userId: string,
  levelId: string,
  lessonId: string
): Promise<LessonProgress | null> {
  const ref = progressDocRef(userId, levelId, lessonId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as LessonProgress;
}

export async function getLessonProgressForLevel(
  userId: string,
  levelId: string
): Promise<LessonProgress[]> {
  const col = progressCollection(userId);
  const q = query(col, where("levelId", "==", levelId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as LessonProgress);
}

export async function getAllLessonProgress(
  userId: string
): Promise<LessonProgress[]> {
  const col = progressCollection(userId);
  const snapshot = await getDocs(col);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as LessonProgress);
}

// ─── Transactional Completion Check ───

export async function completeLessonIfReady(
  userId: string,
  levelId: string,
  lessonId: string,
  totalExercises: number,
  totalLessonsInLevel: number,
  userDisplayName?: string,
  userPhotoURL?: string | null
): Promise<boolean> {
  const db = getFirebaseDb();
  const ref = progressDocRef(userId, levelId, lessonId);

  const completed = await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    const data = snap.data() as Partial<LessonProgress> | undefined;

    // Already completed — idempotent early return
    if (data?.completedAt) return false;

    // Content must be read first
    if (!data?.contentReadAt) return false;

    // Count exercise completions for this level + lesson
    const completions = await getCompletionsForLesson(userId, lessonId, levelId);
    if (completions.length < totalExercises) return false;

    // All conditions met — mark lesson as completed
    transaction.update(ref, {
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return true;
  });

  if (completed) {
    // Log activity (non-critical, outside transaction)
    try {
      await logActivity(userId, {
        type: "lesson_completed",
        title: `Completed lesson: ${lessonId}`,
        metadata: { lessonId, levelId },
        userDisplayName: userDisplayName ?? "User",
        userPhotoURL: userPhotoURL ?? null,
      });
    } catch (err) {
      console.error("Failed to log lesson_completed activity:", err);
    }

    // Gamification event (non-critical)
    try {
      await emitGamificationEvent(userId, {
        type: "lesson_completed",
        sourceId: `${levelId}_${lessonId}`,
        levelId,
        lessonId,
      });
    } catch (err) {
      console.error("Failed to emit gamification event:", err);
    }

    // Check if the entire level is now complete
    try {
      await checkLevelCompletion(
        userId,
        levelId,
        totalLessonsInLevel,
        userDisplayName,
        userPhotoURL
      );
    } catch (err) {
      console.error("Failed to check level completion:", err);
    }
  }

  return completed;
}

// ─── Level Completion Check ───

export async function checkLevelCompletion(
  userId: string,
  levelId: string,
  totalLessonsInLevel: number,
  userDisplayName?: string,
  userPhotoURL?: string | null
): Promise<boolean> {
  const db = getFirebaseDb();

  // Count completed lessons for this level
  const col = progressCollection(userId);
  const q = query(
    col,
    where("levelId", "==", levelId),
    where("completedAt", "!=", null)
  );
  const snapshot = await getDocs(q);

  if (snapshot.size < totalLessonsInLevel) return false;

  // All lessons completed — advance currentLevel if needed
  const userRef = doc(db, "users", userId);
  const levelOrder = parseInt(levelId.replace("level-", ""), 10);
  const nextLevel = levelOrder + 1;

  const advanced = await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) return false;

    const userData = userSnap.data() as User;
    // Only advance, never downgrade (prevents old level revisit from lowering)
    if (nextLevel <= userData.currentLevel) return false;

    transaction.update(userRef, {
      currentLevel: nextLevel,
      updatedAt: serverTimestamp(),
    });

    return true;
  });

  if (advanced) {
    try {
      await logActivity(userId, {
        type: "level_up",
        title: `Advanced to level ${nextLevel}`,
        metadata: { levelId, newLevel: String(nextLevel) },
        userDisplayName: userDisplayName ?? "User",
        userPhotoURL: userPhotoURL ?? null,
      });
    } catch (err) {
      console.error("Failed to log level_up activity:", err);
    }

    // Gamification event (non-critical)
    try {
      await emitGamificationEvent(userId, {
        type: "level_up",
        sourceId: levelId,
        levelId,
      });
    } catch (err) {
      console.error("Failed to emit gamification event:", err);
    }
  }

  return advanced;
}
