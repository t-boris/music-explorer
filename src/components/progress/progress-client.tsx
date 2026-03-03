"use client";

import { useProgress } from "@/hooks/use-progress";
import { SkillRadar } from "@/components/progress/skill-radar";
import { LevelProgress } from "@/components/progress/level-progress";
import { SessionHistory } from "@/components/progress/session-history";
import { LearningProgress } from "@/components/progress/learning-progress";
import { useAuth } from "@/hooks/use-auth";
import { useGamification } from "@/hooks/use-gamification";
import { GamificationSummary } from "@/components/gamification/gamification-summary";
import { BadgeGrid } from "@/components/gamification/badge-grid";
import type { ContentSummaryItem } from "@/lib/content";

interface ProgressClientProps {
  contentSummary: ContentSummaryItem[];
}

export function ProgressClient({ contentSummary }: ProgressClientProps) {
  const { user, loading: authLoading, error: authError } = useAuth();
  const { progressSummary, currentLevel, sessions, loading, error } = useProgress();
  const {
    profile: gamProfile,
    badges,
    nextRank,
    xpToNextRank,
  } = useGamification();

  if (authLoading || loading) {
    return (
      <>
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
      </>
    );
  }

  if (authError || error) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <p className="text-sm text-red-400">{authError || error}</p>
        <p className="mt-1 text-xs text-text-muted">
          Try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-2 text-3xl font-heading text-text-primary">
        Your Progress
      </h1>
      <p className="mb-8 text-text-secondary">
        Track skill progression, test scores, and practice streaks.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gamification Summary - spans full width */}
        {gamProfile && (
          <div className="lg:col-span-2">
            <GamificationSummary
              profile={gamProfile}
              nextRank={nextRank}
              xpToNextRank={xpToNextRank}
            />
          </div>
        )}

        {/* Learning Progress - spans full width */}
        <div className="lg:col-span-2">
          <LearningProgress contentSummary={contentSummary} />
        </div>

        {/* Skill Radar - left column on desktop */}
        <div className="lg:col-span-1">
          <SkillRadar progressSummary={progressSummary} />
        </div>

        {/* Level Progress - right column on desktop */}
        <div className="lg:col-span-1">
          <LevelProgress currentLevel={currentLevel} />
        </div>

        {/* Badges - spans full width */}
        <div className="lg:col-span-2">
          <BadgeGrid earnedBadges={badges} />
        </div>

        {/* Session History - spans full width */}
        <div className="lg:col-span-2">
          <SessionHistory sessions={sessions} userId={user!.uid} />
        </div>
      </div>
    </>
  );
}
