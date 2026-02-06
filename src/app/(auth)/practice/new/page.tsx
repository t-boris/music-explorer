import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getLevels, getLessons, getExercisesForLesson } from "@/lib/content";
import { SessionForm } from "@/components/practice/session-form";
import type { Exercise, Level } from "@/types/index";

export const dynamic = "force-dynamic";

/**
 * Server component wrapper that fetches exercise + level data from the
 * server-only content module and passes it to the client SessionForm.
 */
export default function NewSessionPage() {
  const levels = getLevels();

  // Collect all exercises across all levels and lessons
  const allExercises: Exercise[] = [];
  for (const level of levels) {
    const lessons = getLessons(level.id);
    for (const lesson of lessons) {
      const exercises = getExercisesForLesson(level.id, lesson.id);
      allExercises.push(...exercises);
    }
  }

  // Only pass levels that have content (exercises)
  const levelIdsWithExercises = new Set(allExercises.map((ex) => ex.levelId));
  const levelsWithContent: Level[] = levels.filter(
    (l) => levelIdsWithExercises.has(l.id)
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/practice"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Practice
      </Link>

      <h1 className="mb-6 text-3xl font-heading text-text-primary">
        Log Practice Session
      </h1>

      <div className="rounded-xl border border-surface-700 bg-surface-800 p-6">
        <SessionForm exercises={allExercises} levels={levelsWithContent} />
      </div>
    </main>
  );
}
