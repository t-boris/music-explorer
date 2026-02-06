import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getLevels, getLessons, getExercisesForLesson } from "@/lib/content";
import { EditSessionClient } from "./edit-session-client";
import type { Exercise, Level } from "@/types/index";

export const dynamic = "force-dynamic";

/**
 * Server component that fetches content data (exercises, levels) and
 * passes them to the client component that handles session fetching.
 */
export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const levels = getLevels();

  const allExercises: Exercise[] = [];
  for (const level of levels) {
    const lessons = getLessons(level.id);
    for (const lesson of lessons) {
      const exercises = getExercisesForLesson(level.id, lesson.id);
      allExercises.push(...exercises);
    }
  }

  const levelIdsWithExercises = new Set(allExercises.map((ex) => ex.levelId));
  const levelsWithContent: Level[] = levels.filter(
    (l) => levelIdsWithExercises.has(l.id)
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href={`/practice/${sessionId}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Session
      </Link>

      <h1 className="mb-6 text-3xl font-heading text-text-primary">
        Edit Practice Session
      </h1>

      <EditSessionClient
        sessionId={sessionId}
        exercises={allExercises}
        levels={levelsWithContent}
      />
    </main>
  );
}
