"use client";

import { LevelCard } from "@/components/content/level-card";
import { useAllLessonProgress } from "@/hooks/use-all-lesson-progress";
import { useAuth } from "@/hooks/use-auth";
import type { Level } from "@/types/index";

interface LevelsWithProgressProps {
  levels: Level[];
  activeLevelIds: string[];
  lessonCounts: Record<string, number>;
}

export function LevelsWithProgress({
  levels,
  activeLevelIds,
  lessonCounts,
}: LevelsWithProgressProps) {
  const { user } = useAuth();
  const { progressByLesson, loading } = useAllLessonProgress();

  const activeSet = new Set(activeLevelIds);

  // Compute completed lessons per level from progress data
  function getCompletedLessons(levelId: string): number | undefined {
    if (!user || loading) return undefined;

    let count = 0;
    for (const [key, progress] of progressByLesson) {
      if (progress.levelId === levelId && progress.completedAt != null) {
        count++;
      }
    }
    return count;
  }

  return (
    <div className="flex flex-col gap-4">
      {levels.map((level) => {
        const isActive = activeSet.has(level.id);
        return (
          <LevelCard
            key={level.id}
            level={level}
            isActive={isActive}
            lessonCount={lessonCounts[level.id] ?? 0}
            completedLessons={isActive ? getCompletedLessons(level.id) : undefined}
          />
        );
      })}
    </div>
  );
}
