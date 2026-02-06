"use client";

import { useProgress } from "@/hooks/use-progress";
import { SkillRadar } from "@/components/progress/skill-radar";
import { LevelProgress } from "@/components/progress/level-progress";
import { SessionHistory } from "@/components/progress/session-history";
import { useAuth } from "@/hooks/use-auth";

export default function ProgressPage() {
  const { loading: authLoading, error: authError } = useAuth();
  const { progressSummary, currentLevel, sessions, loading, error } = useProgress();

  if (authLoading || loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-heading text-text-primary">
          Your Progress
        </h1>
        <p className="mt-2 text-text-secondary">Loading your progress...</p>
        <div className="mt-8 grid gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl border border-surface-700 bg-surface-800"
            />
          ))}
        </div>
      </main>
    );
  }

  if (authError || error) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
        <p className="text-sm text-red-400">{authError || error}</p>
        <p className="mt-1 text-xs text-text-muted">
          Try refreshing the page.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-heading text-text-primary">
        Your Progress
      </h1>
      <p className="mb-8 text-text-secondary">
        Track skill progression, test scores, and practice streaks.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Skill Radar - spans full width on mobile, left column on desktop */}
        <div className="lg:col-span-1">
          <SkillRadar progressSummary={progressSummary} />
        </div>

        {/* Level Progress - right column on desktop */}
        <div className="lg:col-span-1">
          <LevelProgress currentLevel={currentLevel} />
        </div>

        {/* Session History - spans full width */}
        <div className="lg:col-span-2">
          <SessionHistory sessions={sessions} />
        </div>
      </div>
    </main>
  );
}
