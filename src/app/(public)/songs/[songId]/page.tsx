import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { getSong, getLevel } from "@/lib/content";
import { mdxComponents } from "@/components/content/mdx-components";
import { TheoryTag } from "@/components/content/theory-tag";

interface SongDetailPageProps {
  params: Promise<{ songId: string }>;
}

function DifficultyDots({ difficulty }: { difficulty: number }) {
  return (
    <div
      className="flex items-center gap-1"
      title={`Difficulty: ${difficulty}/5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            i < difficulty ? "bg-accent-400" : "bg-surface-600"
          }`}
        />
      ))}
    </div>
  );
}

export async function generateMetadata({ params }: SongDetailPageProps) {
  const { songId } = await params;
  const result = getSong(songId);
  if (!result) return { title: "Song Not Found" };
  const { song } = result;
  return {
    title: `${song.title} by ${song.artist} | Music Explorer`,
    description: song.description,
  };
}

export default async function SongDetailPage({
  params,
}: SongDetailPageProps) {
  const { songId } = await params;
  const result = getSong(songId);

  if (!result) {
    notFound();
  }

  const { song, content } = result;

  // Resolve linked levels for the sidebar
  const linkedLevels = song.levelIds
    .map((levelId) => getLevel(levelId))
    .filter(Boolean);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-text-muted">
        <Link
          href="/songs"
          className="transition-colors hover:text-accent-400"
        >
          Songs
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-text-secondary">{song.title}</span>
      </nav>

      {/* Song header */}
      <header className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
          {song.title}
        </h1>
        <p className="mt-1 text-lg text-text-secondary">{song.artist}</p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <DifficultyDots difficulty={song.difficulty} />
          {song.tags.map((tag) => (
            <TheoryTag key={tag} tag={tag} />
          ))}
        </div>
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

      {/* Theory Concepts — linked levels */}
      {linkedLevels.length > 0 && (
        <section className="mt-10 rounded-xl border border-surface-700 bg-surface-800 p-5">
          <h2 className="mb-3 font-heading text-lg font-semibold text-text-primary">
            Theory Concepts
          </h2>
          <p className="mb-4 text-sm text-text-muted">
            This song connects to the following levels in the learning path:
          </p>
          <div className="flex flex-col gap-2">
            {linkedLevels.map((level) =>
              level ? (
                <Link
                  key={level.id}
                  href={`/levels/${level.id}`}
                  className="flex items-center gap-3 rounded-lg border border-surface-700 bg-surface-900 p-3 transition-colors hover:border-accent-500/40 hover:bg-surface-800"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-500/15 font-heading text-sm font-bold text-accent-400">
                    {level.order}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Level {level.order}: {level.title}
                    </p>
                    <p className="text-xs text-text-muted">
                      {level.description}
                    </p>
                  </div>
                </Link>
              ) : null
            )}
          </div>
        </section>
      )}

      {/* Related exercises placeholder */}
      <section className="mt-6 rounded-xl border border-surface-700/50 bg-surface-800/50 p-5">
        <h2 className="mb-2 font-heading text-lg font-semibold text-text-muted">
          Related Exercises
        </h2>
        <p className="text-sm text-text-muted">
          Exercises derived from this song will appear here in a future update.
        </p>
      </section>
    </main>
  );
}
