"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  getCompletionsForLesson,
  toggleExerciseCompletion,
  type ToggleExerciseData,
} from "@/lib/exercise-service";

interface UseExerciseCompletionsResult {
  completedIds: Set<string>;
  toggle: (exercise: ToggleExerciseData) => Promise<void>;
  loading: boolean;
  togglingId: string | null;
}

export function useExerciseCompletions(
  lessonId: string,
  levelId: string
): UseExerciseCompletionsResult {
  const { user } = useAuth();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCompletedIds(new Set());
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchCompletions() {
      try {
        const completions = await getCompletionsForLesson(user!.uid, lessonId, levelId);
        if (!cancelled) {
          setCompletedIds(new Set(completions.map((c) => c.exerciseId)));
        }
      } catch (err) {
        console.error("Failed to fetch exercise completions:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    setLoading(true);
    fetchCompletions();

    return () => {
      cancelled = true;
    };
  }, [user, lessonId, levelId]);

  const toggle = useCallback(
    async (exercise: ToggleExerciseData) => {
      if (!user) return;

      setTogglingId(exercise.exerciseId);

      // Optimistic update
      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (next.has(exercise.exerciseId)) {
          next.delete(exercise.exerciseId);
        } else {
          next.add(exercise.exerciseId);
        }
        return next;
      });

      try {
        const isNowCompleted = await toggleExerciseCompletion(user.uid, exercise);

        // Reconcile with server truth
        setCompletedIds((prev) => {
          const next = new Set(prev);
          if (isNowCompleted) {
            next.add(exercise.exerciseId);
          } else {
            next.delete(exercise.exerciseId);
          }
          return next;
        });
      } catch (err) {
        console.error("Failed to toggle exercise completion:", err);
        // Revert optimistic update
        setCompletedIds((prev) => {
          const next = new Set(prev);
          if (next.has(exercise.exerciseId)) {
            next.delete(exercise.exerciseId);
          } else {
            next.add(exercise.exerciseId);
          }
          return next;
        });
      } finally {
        setTogglingId(null);
      }
    },
    [user]
  );

  return { completedIds, toggle, loading, togglingId };
}
