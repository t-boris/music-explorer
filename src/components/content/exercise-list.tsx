import type { Exercise } from "@/types/index";
import { ExerciseCard } from "@/components/content/exercise-card";

interface ExerciseListProps {
  exercises: Exercise[];
}

export function ExerciseList({ exercises }: ExerciseListProps) {
  if (exercises.length === 0) {
    return null;
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="font-heading text-xl font-semibold text-text-primary">
          Exercises
        </h2>
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-accent-500/15 px-2 text-xs font-medium text-accent-400">
          {exercises.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {exercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>
    </section>
  );
}
