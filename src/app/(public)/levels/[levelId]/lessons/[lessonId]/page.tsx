import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ClipboardCheck } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { getLevel, getLesson, getExercisesForLesson } from "@/lib/content";
import { mdxComponents } from "@/components/content/mdx-components";
import { ExerciseList } from "@/components/content/exercise-list";
import { TheoryTag } from "@/components/content/theory-tag";

interface LessonPageProps {
  params: Promise<{ levelId: string; lessonId: string }>;
}

export async function generateMetadata({ params }: LessonPageProps) {
  const { levelId, lessonId } = await params;
  const result = getLesson(levelId, lessonId);
  if (!result) return { title: "Lesson Not Found" };
  const { lesson } = result;
  return {
    title: `${lesson.title} | Level ${lesson.levelId} | Music Explorer`,
    description: `Lesson ${lesson.order}: ${lesson.title}`,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { levelId, lessonId } = await params;
  const level = getLevel(levelId);
  const result = getLesson(levelId, lessonId);

  if (!level || !result) {
    notFound();
  }

  const { lesson, content } = result;
  const exercises = getExercisesForLesson(levelId, lessonId);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-text-muted">
        <Link
          href="/levels"
          className="transition-colors hover:text-accent-400"
        >
          Levels
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/levels/${levelId}`}
          className="transition-colors hover:text-accent-400"
        >
          Level {level.order}: {level.title}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-text-secondary">
          Lesson {lesson.order}: {lesson.title}
        </span>
      </nav>

      {/* Lesson header */}
      <header className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
          {lesson.title}
        </h1>
        {lesson.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {lesson.tags.map((tag) => (
              <TheoryTag key={tag} tag={tag} />
            ))}
          </div>
        )}
      </header>

      {/* Theory content (MDX) */}
      <article className="prose-custom">
        <MDXRemote
          source={content}
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
            },
          }}
        />
      </article>

      {/* Exercises */}
      <ExerciseList exercises={exercises} />

      {/* Take Test CTA */}
      <div className="mt-10 rounded-xl border border-surface-700 bg-surface-800 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-500/20">
            <ClipboardCheck className="h-5 w-5 text-accent-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-lg font-medium text-text-primary">
              Test Your Knowledge
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              Ready to check what you learned? Take a theory test or practice ear training.
            </p>
            <Link
              href={`/levels/${levelId}/lessons/${lessonId}/test`}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-surface-900 transition-colors hover:bg-accent-600"
            >
              <ClipboardCheck className="h-4 w-4" />
              Take Test
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
