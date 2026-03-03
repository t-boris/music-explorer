"use client";

import { Flame, Zap, BookOpen, Target, Mic } from "lucide-react";
import type { GamificationProfile } from "@/types/index";
import type { RankDefinition } from "@/lib/gamification-config";
import { RANKS } from "@/lib/gamification-config";

interface GamificationSummaryProps {
  profile: GamificationProfile;
  nextRank: RankDefinition | null;
  xpToNextRank: number;
}

export function GamificationSummary({
  profile,
  nextRank,
  xpToNextRank,
}: GamificationSummaryProps) {
  // Progress bar percentage toward next rank
  const currentRankDef = [...RANKS]
    .reverse()
    .find((r) => profile.totalXp >= r.minXp);
  const progressPercent = nextRank
    ? ((profile.totalXp - (currentRankDef?.minXp ?? 0)) /
        (nextRank.minXp - (currentRankDef?.minXp ?? 0))) *
      100
    : 100;

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-heading text-text-primary">
        <Zap className="h-5 w-5 text-amber-400" />
        Gamification
      </h2>

      {/* XP + Rank */}
      <div className="flex items-baseline gap-3">
        <span
          className="font-heading text-4xl font-bold text-accent-400"
          style={{ textShadow: "0 0 24px oklch(0.75 0.18 85 / 0.3)" }}
        >
          {profile.totalXp}
        </span>
        <span className="text-sm text-text-muted">XP</span>
        <span className="ml-auto rounded-full bg-accent-500/15 px-2.5 py-0.5 text-xs font-semibold text-accent-400">
          {profile.rank}
        </span>
      </div>

      {/* Progress to next rank */}
      {nextRank && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>{currentRankDef?.name}</span>
            <span>
              {xpToNextRank} XP to {nextRank.name}
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-surface-700">
            <div
              className="h-2 rounded-full bg-accent-500 transition-all"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Streak + Stats row */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatItem
          icon={<Flame className="h-4 w-4 text-orange-400" />}
          label="Streak"
          value={`${profile.streakDays}d`}
        />
        <StatItem
          icon={<Target className="h-4 w-4 text-green-400" />}
          label="Exercises"
          value={String(profile.totalCounts.exercise_completed)}
        />
        <StatItem
          icon={<BookOpen className="h-4 w-4 text-blue-400" />}
          label="Lessons"
          value={String(profile.totalCounts.lesson_completed)}
        />
        <StatItem
          icon={<Mic className="h-4 w-4 text-purple-400" />}
          label="Recordings"
          value={String(profile.totalCounts.recording_created)}
        />
      </div>
    </div>
  );
}

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-surface-700 px-3 py-2">
      {icon}
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-semibold text-text-primary">{value}</p>
      </div>
    </div>
  );
}
