"use client";

import Link from "next/link";
import { TrendingUp, ArrowRight } from "lucide-react";
import type { SkillType, User } from "@/types/index";

interface ProgressOverviewProps {
  user: User | null;
}

const SKILL_LABELS: Record<SkillType, string> = {
  rhythm: "Rhythm",
  intervals: "Intervals",
  chords: "Chords",
  fretboard: "Fretboard",
  technique: "Technique",
  ear: "Ear Training",
};

const SKILL_ORDER: SkillType[] = [
  "rhythm",
  "intervals",
  "chords",
  "fretboard",
  "technique",
  "ear",
];

const LEVEL_TITLES: Record<number, string> = {
  0: "Physics of Sound",
  1: "Reading Music",
  2: "Intervals",
  3: "Scales & Modes",
  4: "Chords & Voicings",
  5: "Rhythm & Groove",
  6: "Chord Progressions",
  7: "Melody & Improvisation",
  8: "Applied Theory",
  9: "Advanced Harmony",
  10: "Composition",
  11: "Advanced Techniques",
  12: "Mastery",
};

export function ProgressOverview({ user }: ProgressOverviewProps) {
  const currentLevel = user?.currentLevel ?? 0;
  const progressSummary = user?.progressSummary;

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-heading text-text-primary">
        <TrendingUp className="h-5 w-5 text-accent-400" />
        Progress
      </h2>

      {/* Current level indicator */}
      <div className="mb-4 rounded-lg bg-surface-700/50 px-3 py-2">
        <span className="text-xs text-text-muted">Current Level</span>
        <p className="text-sm font-medium text-text-primary">
          Level {currentLevel}: {LEVEL_TITLES[currentLevel] ?? "Unknown"}
        </p>
      </div>

      {/* Skill bars */}
      <div className="space-y-3">
        {SKILL_ORDER.map((skill) => {
          const score = progressSummary?.[skill]?.score ?? 0;
          const pct = Math.min(Math.round(score * 100), 100);

          return (
            <div key={skill}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-text-muted">{SKILL_LABELS[skill]}</span>
                <span className="text-text-secondary">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-surface-700">
                <div
                  className="h-2 rounded-full bg-accent-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Link to full progress page */}
      <Link
        href="/progress"
        className="mt-4 inline-flex items-center gap-1 text-sm text-accent-400 transition-colors hover:text-accent-300"
      >
        View Full Progress
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
