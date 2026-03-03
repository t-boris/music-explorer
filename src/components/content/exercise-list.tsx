"use client";

import type { Exercise } from "@/types/index";
import { ExerciseCard } from "@/components/content/exercise-card";
import { useExerciseCompletions } from "@/hooks/use-exercise-completions";
import { useAuth } from "@/hooks/use-auth";
import { completeLessonIfReady } from "@/lib/lesson-progress-service";

interface ExerciseListProps {
  exercises: Exercise[];
  lessonId: string;
  levelId: string;
  totalLessonsInLevel: number;
}

export function ExerciseList({ exercises, lessonId, levelId, totalLessonsInLevel }: ExerciseListProps) {
  const { user } = useAuth();
  const { completedIds, toggle, loading, togglingId } = useExerciseCompletions(lessonId, levelId);

  if (exercises.length === 0) {
    return null;
  }

  const completedCount = exercises.filter((e) => completedIds.has(e.id)).length;

  async function handleToggle(exercise: Exercise) {
    if (!user) return;

    await toggle({
      exerciseId: exercise.id,
      exerciseTitle: exercise.title,
      lessonId,
      levelId,
      exerciseType: exercise.type,
    });

    // After toggling, check if the lesson is now complete.
    // completeLessonIfReady is idempotent — safe to call on every toggle.
    try {
      await completeLessonIfReady(
        user.uid,
        levelId,
        lessonId,
        exercises.length,
        totalLessonsInLevel,
        user.displayName ?? undefined,
        user.photoURL
      );
    } catch (err) {
      console.error("Failed to check lesson completion:", err);
    }
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="font-heading text-xl font-semibold text-text-primary">
          Exercises
        </h2>
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-accent-500/15 px-2 text-xs font-medium text-accent-400">
          {user && !loading
            ? `${completedCount}/${exercises.length}`
            : exercises.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            completed={completedIds.has(exercise.id)}
            toggling={togglingId === exercise.id}
            onToggle={user ? () => handleToggle(exercise) : undefined}
          />
        ))}
      </div>
    </section>
  );
}
