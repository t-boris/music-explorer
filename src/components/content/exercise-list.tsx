"use client";

import type { Exercise } from "@/types/index";
import { ExerciseCard } from "@/components/content/exercise-card";
import { useExerciseCompletions } from "@/hooks/use-exercise-completions";
import { useAuth } from "@/hooks/use-auth";

interface ExerciseListProps {
  exercises: Exercise[];
  lessonId: string;
  levelId: string;
}

export function ExerciseList({ exercises, lessonId, levelId }: ExerciseListProps) {
  const { user } = useAuth();
  const { completedIds, toggle, loading, togglingId } = useExerciseCompletions(lessonId, levelId);

  if (exercises.length === 0) {
    return null;
  }

  const completedCount = exercises.filter((e) => completedIds.has(e.id)).length;

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
            onToggle={
              user
                ? () =>
                    toggle({
                      exerciseId: exercise.id,
                      exerciseTitle: exercise.title,
                      lessonId,
                      levelId,
                      exerciseType: exercise.type,
                    })
                : undefined
            }
          />
        ))}
      </div>
    </section>
  );
}
