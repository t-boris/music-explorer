import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, BookOpen } from "lucide-react";
import { getLevel, getLevels, getLessons } from "@/lib/content";
import { LessonCard } from "@/components/content/lesson-card";

export function generateStaticParams() {
  return getLevels().map((level) => ({ levelId: level.id }));
}

interface LevelDetailPageProps {
  params: Promise<{ levelId: string }>;
}

export async function generateMetadata({ params }: LevelDetailPageProps) {
  const { levelId } = await params;
  const level = getLevel(levelId);
  if (!level) return { title: "Level Not Found" };
  return {
    title: `Level ${level.order}: ${level.title} | Music Explorer`,
    description: level.description,
  };
}

export default async function LevelDetailPage({ params }: LevelDetailPageProps) {
  const { levelId } = await params;
  const level = getLevel(levelId);

  if (!level) {
    notFound();
  }

  const lessons = getLessons(levelId);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/levels"
        className="mb-6 inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-accent-400"
      >
        <ChevronLeft className="h-4 w-4" />
        All Levels
      </Link>

      {/* Level header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-500/15 font-heading text-lg font-bold text-accent-400">
            {level.order}
          </span>
          <h1 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
            {level.title}
          </h1>
        </div>
        <p className="mt-2 text-text-secondary">{level.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {level.skillFocus.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-surface-700 px-2.5 py-0.5 text-xs font-medium text-text-secondary"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Lessons list */}
      {lessons.length > 0 ? (
        <div>
          <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">
            Lessons
            <span className="ml-2 text-sm font-normal text-text-muted">
              ({lessons.length})
            </span>
          </h2>
          <div className="flex flex-col gap-3">
            {lessons.map((lesson, index) => (
              <LessonCard key={lesson.id} lesson={lesson} index={index} />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-surface-700 bg-surface-800 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-700">
            <BookOpen className="h-5 w-5 text-text-muted" />
          </div>
          <h3 className="font-heading text-lg font-semibold text-text-primary">
            Coming Soon
          </h3>
          <p className="mt-2 text-sm text-text-muted">
            Lessons for this level are being developed. Complete the previous
            levels to build a strong foundation.
          </p>
          {level.order > 0 && (
            <Link
              href={`/levels/level-${level.order - 1}`}
              className="mt-4 inline-flex items-center gap-1 text-sm text-accent-400 hover:text-accent-500"
            >
              <ChevronLeft className="h-4 w-4" />
              Go to Level {level.order - 1}
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
