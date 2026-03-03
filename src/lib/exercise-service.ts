"use client";

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { updateSkillScore, createProgressEntry } from "@/lib/progress-service";
import { logActivity } from "@/lib/activity-service";
import { emitGamificationEvent } from "@/lib/gamification-service";
import type { Exercise, ExerciseCompletion, SkillType } from "@/types/index";

// ─── Collection Path Helper ───

function completionsCollection(userId: string) {
  return collection(getFirebaseDb(), "users", userId, "exerciseCompletions");
}

// ─── Exercise Type → SkillType Mapping ───

const EXERCISE_TYPE_TO_SKILL: Record<Exercise["type"], SkillType> = {
  ear: "ear",
  rhythm: "rhythm",
  fretboard: "fretboard",
  technique: "technique",
  theory: "intervals",
};

// ─── Skill Score Increment ───

const SKILL_SCORE_INCREMENT = 0.02;
const SKILL_SCORE_MAX = 1;

// ─── Toggle Exercise Completion ───

export interface ToggleExerciseData {
  exerciseId: string;
  exerciseTitle: string;
  lessonId: string;
  levelId: string;
  exerciseType: Exercise["type"];
}

/**
 * Toggles exercise completion: if already completed, removes it; otherwise creates it.
 * Returns `true` if the exercise is now completed, `false` if uncompleted.
 */
export async function toggleExerciseCompletion(
  userId: string,
  data: ToggleExerciseData,
  userDisplayName?: string,
  userPhotoURL?: string | null
): Promise<boolean> {
  const col = completionsCollection(userId);
  const q = query(col, where("exerciseId", "==", data.exerciseId));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    // Already completed — remove it (uncomplete)
    const existingDoc = snapshot.docs[0];
    await deleteDoc(doc(getFirebaseDb(), "users", userId, "exerciseCompletions", existingDoc.id));
    return false;
  }

  // Not yet completed — create completion
  const docRef = await addDoc(col, {
    userId,
    exerciseId: data.exerciseId,
    exerciseTitle: data.exerciseTitle,
    lessonId: data.lessonId,
    levelId: data.levelId,
    exerciseType: data.exerciseType,
    completedAt: serverTimestamp(),
  });

  // Update skill score (small increment, capped at max)
  const skillType = EXERCISE_TYPE_TO_SKILL[data.exerciseType];
  if (skillType) {
    try {
      // We don't want skill update failures to break the toggle
      await updateSkillScore(
        userId,
        skillType,
        Math.min(SKILL_SCORE_INCREMENT, SKILL_SCORE_MAX)
      );
      await createProgressEntry(userId, {
        skillType,
        levelId: data.levelId,
        score: SKILL_SCORE_INCREMENT,
        source: "exercise",
        sourceId: data.exerciseId,
      });
    } catch (err) {
      console.error("Failed to update skill score for exercise completion:", err);
    }
  }

  // Log activity event (non-critical)
  try {
    await logActivity(userId, {
      type: "exercise_completed",
      title: `Completed exercise: ${data.exerciseTitle}`,
      metadata: {
        exerciseId: data.exerciseId,
        lessonId: data.lessonId,
        levelId: data.levelId,
      },
      userDisplayName: userDisplayName ?? "User",
      userPhotoURL: userPhotoURL ?? null,
    });
  } catch (err) {
    console.error("Failed to log exercise activity:", err);
  }

  // Gamification event (non-critical)
  try {
    await emitGamificationEvent(userId, {
      type: "exercise_completed",
      sourceId: data.exerciseId,
      levelId: data.levelId,
      lessonId: data.lessonId,
    });
  } catch (err) {
    console.error("Failed to emit gamification event:", err);
  }

  return true;
}

// ─── Get Completions for a Lesson ───

export async function getCompletionsForLesson(
  userId: string,
  lessonId: string,
  levelId: string
): Promise<ExerciseCompletion[]> {
  const col = completionsCollection(userId);
  const q = query(
    col,
    where("lessonId", "==", lessonId),
    where("levelId", "==", levelId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as ExerciseCompletion[];
}

// ─── Get Recent Completions (all lessons) ───

export async function getCompletionsForAllLessons(
  userId: string,
  count: number = 20
): Promise<ExerciseCompletion[]> {
  const col = completionsCollection(userId);
  const q = query(col, orderBy("completedAt", "desc"), limit(count));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as ExerciseCompletion[];
}
