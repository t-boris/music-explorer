"use client";

import { Flame, Timer } from "lucide-react";

interface StreakDisplayProps {
  currentStreak: number;
  totalMinutes: number;
  weeklyMinutes: number;
}

export function StreakDisplay({
  currentStreak,
  totalMinutes,
  weeklyMinutes,
}: StreakDisplayProps) {
  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-heading text-text-primary">
        <Flame className="h-5 w-5 text-amber-400" />
        Streak
      </h2>

      {/* Large streak number */}
      <div className="flex items-baseline gap-2">
        <span
          className="font-heading text-5xl font-bold text-accent-400"
          style={{ textShadow: "0 0 24px oklch(0.75 0.18 85 / 0.3)" }}
        >
          {currentStreak}
        </span>
        <span className="text-sm text-text-muted">
          day{currentStreak !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Total practice minutes */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-text-muted">
            <Timer className="h-3.5 w-3.5" />
            Total practice
          </span>
          <span className="font-medium text-text-secondary">
            {totalMinutes} min
          </span>
        </div>

        {/* Weekly minutes comparison */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">This week</span>
          <span className="font-medium text-text-secondary">
            {weeklyMinutes} min
          </span>
        </div>

        {/* Weekly progress bar */}
        <div className="h-2 rounded-full bg-surface-700">
          <div
            className="h-2 rounded-full bg-accent-500 transition-all"
            style={{
              width: `${Math.min((weeklyMinutes / Math.max(totalMinutes, 1)) * 100, 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
