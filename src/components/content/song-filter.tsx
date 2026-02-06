"use client";

import { useState, useMemo } from "react";
import { SongCard } from "@/components/content/song-card";
import type { Song } from "@/types/index";

interface SongFilterProps {
  songs: Song[];
  allTags: string[];
}

export function SongFilter({ songs, allTags }: SongFilterProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeDifficulty, setActiveDifficulty] = useState<number | null>(null);

  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      if (activeTag && !song.tags.includes(activeTag)) return false;
      if (activeDifficulty !== null && song.difficulty !== activeDifficulty)
        return false;
      return true;
    });
  }, [songs, activeTag, activeDifficulty]);

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap gap-2">
        {/* Tag filters */}
        <button
          onClick={() => setActiveTag(null)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            activeTag === null
              ? "bg-accent-500 text-surface-900"
              : "bg-surface-700 text-text-secondary hover:bg-surface-600"
          }`}
        >
          All tags
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              activeTag === tag
                ? "bg-accent-500 text-surface-900"
                : "bg-surface-700 text-text-secondary hover:bg-surface-600"
            }`}
          >
            {tag}
          </button>
        ))}

        {/* Difficulty separator */}
        <span className="mx-1 self-center text-surface-600">|</span>

        {/* Difficulty filters */}
        <button
          onClick={() => setActiveDifficulty(null)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            activeDifficulty === null
              ? "bg-accent-500 text-surface-900"
              : "bg-surface-700 text-text-secondary hover:bg-surface-600"
          }`}
        >
          All levels
        </button>
        {[1, 2, 3, 4, 5].map((d) => (
          <button
            key={d}
            onClick={() =>
              setActiveDifficulty(activeDifficulty === d ? null : d)
            }
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              activeDifficulty === d
                ? "bg-accent-500 text-surface-900"
                : "bg-surface-700 text-text-secondary hover:bg-surface-600"
            }`}
          >
            {"★".repeat(d)}
          </button>
        ))}
      </div>

      {/* Song grid */}
      {filteredSongs.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSongs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-surface-700 bg-surface-800 p-8 text-center">
          <p className="text-text-muted">
            No songs match the current filters. Try adjusting your selection.
          </p>
        </div>
      )}
    </div>
  );
}
