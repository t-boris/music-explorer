"use client";

import { ChevronRight } from "lucide-react";

// Static level metadata (matches content.ts LEVELS array)
const LEVELS = [
  { id: 0, title: "Physics of Sound", description: "Frequency, pitch, amplitude, and the overtone series." },
  { id: 1, title: "Reading Music", description: "Staff notation, clefs, note durations, and rhythmic reading." },
  { id: 2, title: "Intervals", description: "Identify and build intervals by ear and on the fretboard." },
  { id: 3, title: "Scales & Modes", description: "Major, minor, and modal scales across the neck." },
  { id: 4, title: "Chords & Voicings", description: "Triads, seventh chords, inversions, and voicings." },
  { id: 5, title: "Rhythm & Groove", description: "Subdivisions, syncopation, swing, and groove patterns." },
  { id: 6, title: "Chord Progressions", description: "Roman numeral analysis and functional harmony." },
  { id: 7, title: "Pentatonic & Blues", description: "Pentatonic scales, blues scale, bending, and vibrato." },
  { id: 8, title: "Arpeggios & Sweep Picking", description: "Arpeggio shapes and sweep picking technique." },
  { id: 9, title: "Advanced Harmony", description: "Extended chords, altered dominants, and substitutions." },
  { id: 10, title: "Improvisation", description: "Target notes, approach patterns, and motivic development." },
  { id: 11, title: "Composition & Arrangement", description: "Song form, melody writing, and arranging." },
  { id: 12, title: "Mastery & Expression", description: "Tone, dynamics, phrasing, and stylistic fluency." },
] as const;

const TOTAL_LEVELS = LEVELS.length; // 13 levels (0-12)

interface LevelProgressProps {
  currentLevel: number;
}

export function LevelProgress({ currentLevel }: LevelProgressProps) {
  const clampedLevel = Math.max(0, Math.min(currentLevel, TOTAL_LEVELS - 1));
  const currentLevelData = LEVELS[clampedLevel];
  const nextLevel = clampedLevel < TOTAL_LEVELS - 1 ? LEVELS[clampedLevel + 1] : null;
  const completedCount = clampedLevel;
  const progressPercent = (completedCount / (TOTAL_LEVELS - 1)) * 100;

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-4 sm:p-6">
      <h3 className="mb-4 text-lg font-heading text-text-primary">
        Level Progress
      </h3>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-xs text-text-muted">
          <span>Level 0</span>
          <span>Level 12</span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-surface-700">
          {/* Completed fill */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-accent-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
          {/* Level markers */}
          {LEVELS.map((level) => (
            <div
              key={level.id}
              className={`absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                level.id < clampedLevel
                  ? "bg-accent-400"
                  : level.id === clampedLevel
                    ? "bg-accent-400 ring-2 ring-accent-400/50"
                    : "bg-surface-600"
              }`}
              style={{
                left: `${(level.id / (TOTAL_LEVELS - 1)) * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Current level info */}
      <div className="mb-3 rounded-lg bg-surface-900/50 p-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-surface-900">
            {clampedLevel}
          </span>
          <span className="font-medium text-text-primary">
            {currentLevelData.title}
          </span>
        </div>
        <p className="mt-1.5 text-sm text-text-secondary">
          {currentLevelData.description}
        </p>
      </div>

      {/* Next level preview */}
      {nextLevel && (
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <ChevronRight className="h-4 w-4 text-accent-400/60" />
          <span>
            Next: <span className="text-text-secondary">Level {nextLevel.id} &mdash; {nextLevel.title}</span>
          </span>
        </div>
      )}

      {!nextLevel && (
        <p className="text-sm text-accent-400">
          You have reached the highest level!
        </p>
      )}
    </div>
  );
}
