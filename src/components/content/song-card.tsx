import Link from "next/link";
import { TheoryTag } from "@/components/content/theory-tag";
import type { Song } from "@/types/index";

interface SongCardProps {
  song: Song;
}

function DifficultyDots({ difficulty }: { difficulty: number }) {
  return (
    <div className="flex items-center gap-1" title={`Difficulty: ${difficulty}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`inline-block h-2 w-2 rounded-full ${
            i < difficulty ? "bg-accent-400" : "bg-surface-600"
          }`}
        />
      ))}
    </div>
  );
}

export function SongCard({ song }: SongCardProps) {
  return (
    <Link href={`/songs/${song.id}`} className="block">
      <div className="rounded-xl border border-surface-700 bg-surface-800 p-5 transition-colors hover:border-accent-500/40 hover:bg-surface-700">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-lg font-semibold text-text-primary">
              {song.title}
            </h3>
            <p className="mt-0.5 text-sm text-text-secondary">{song.artist}</p>
          </div>
          <DifficultyDots difficulty={song.difficulty} />
        </div>

        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          {song.description}
        </p>

        {(song.tags.length > 0 || song.levelIds.length > 0) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {song.tags.map((tag) => (
              <TheoryTag key={tag} tag={tag} />
            ))}
            {song.levelIds.map((levelId) => (
              <span
                key={levelId}
                className="inline-flex rounded-full bg-accent-500/10 px-2.5 py-0.5 text-xs font-medium text-accent-400"
              >
                {levelId.replace("-", " ")}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
