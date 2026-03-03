"use client";

import { useCallback, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import {
  markContentRead,
  completeLessonIfReady,
} from "@/lib/lesson-progress-service";
import type { LessonProgress } from "@/types/index";

interface UseLessonProgressResult {
  contentRead: boolean;
  completed: boolean;
  loading: boolean;
  markAsRead: () => Promise<void>;
}

export function useLessonProgress(
  levelId: string,
  lessonId: string,
  totalExercises: number,
  totalLessonsInLevel: number
): UseLessonProgressResult {
  const { user } = useAuth();
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProgress(null);
      setLoading(false);
      return;
    }

    const ref = doc(
      getFirebaseDb(),
      "users",
      user.uid,
      "lessonProgress",
      `${levelId}_${lessonId}`
    );

    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setProgress({ id: snap.id, ...snap.data() } as LessonProgress);
        } else {
          setProgress(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Lesson progress snapshot error:", err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user, levelId, lessonId]);

  const markAsRead = useCallback(async () => {
    if (!user) return;

    await markContentRead(user.uid, levelId, lessonId);

    // After marking content as read, check if lesson can be completed
    await completeLessonIfReady(
      user.uid,
      levelId,
      lessonId,
      totalExercises,
      totalLessonsInLevel,
      user.displayName ?? undefined,
      user.photoURL
    );
  }, [user, levelId, lessonId, totalExercises, totalLessonsInLevel]);

  return {
    contentRead: progress?.contentReadAt != null,
    completed: progress?.completedAt != null,
    loading,
    markAsRead,
  };
}
