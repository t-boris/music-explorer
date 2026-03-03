"use client";

import { BookOpen, Check, GraduationCap } from "lucide-react";
import { useAllLessonProgress } from "@/hooks/use-all-lesson-progress";
import type { ContentSummaryItem } from "@/lib/content";

interface LearningProgressProps {
  contentSummary: ContentSummaryItem[];
}

export function LearningProgress({ contentSummary }: LearningProgressProps) {
  const { progressByLesson, loading } = useAllLessonProgress();

  const totalLessons = contentSummary.reduce((sum, l) => sum + l.lessonCount, 0);

  // Compute stats from progress data
  let lessonsRead = 0;
  let lessonsCompleted = 0;
  const completedByLevel: Record<string, number> = {};
  const readByLevel: Record<string, number> = {};

  if (!loading) {
    for (const [, progress] of progressByLesson) {
      if (progress.contentReadAt != null) {
        lessonsRead++;
        readByLevel[progress.levelId] = (readByLevel[progress.levelId] ?? 0) + 1;
      }
      if (progress.completedAt != null) {
        lessonsCompleted++;
        completedByLevel[progress.levelId] = (completedByLevel[progress.levelId] ?? 0) + 1;
      }
    }
  }

  const overallPercent = totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-6">
      <div className="mb-4 flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-accent-400" />
        <h2 className="font-heading text-lg font-semibold text-text-primary">
          Learning Progress
        </h2>
      </div>

      {loading ? (
        <div className="h-32 animate-pulse rounded-lg bg-surface-700" />
      ) : (
        <>
          {/* Overall progress bar */}
          <div className="mb-6">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-sm text-text-secondary">
                {lessonsCompleted}/{totalLessons} lessons completed
              </span>
              <span className="text-sm font-medium text-accent-400">
                {overallPercent}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-surface-700">
              <div
                className="h-full rounded-full bg-accent-500 transition-all duration-500"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-surface-700/50 p-3 text-center">
              <div className="text-xl font-bold text-text-primary">{lessonsRead}</div>
              <div className="text-xs text-text-muted">Lessons Read</div>
            </div>
            <div className="rounded-lg bg-surface-700/50 p-3 text-center">
              <div className="text-xl font-bold text-text-primary">{lessonsCompleted}</div>
              <div className="text-xs text-text-muted">Lessons Completed</div>
            </div>
            <div className="rounded-lg bg-surface-700/50 p-3 text-center">
              <div className="text-xl font-bold text-text-primary">
                {contentSummary.filter(
                  (l) => (completedByLevel[l.levelId] ?? 0) >= l.lessonCount
                ).length}
              </div>
              <div className="text-xs text-text-muted">Levels Completed</div>
            </div>
          </div>

          {/* Per-level breakdown */}
          <div className="space-y-3">
            {contentSummary.map((level) => {
              const completed = completedByLevel[level.levelId] ?? 0;
              const read = readByLevel[level.levelId] ?? 0;
              const percent =
                level.lessonCount > 0
                  ? Math.round((completed / level.lessonCount) * 100)
                  : 0;
              const isLevelDone = completed >= level.lessonCount;

              return (
                <div key={level.levelId} className="rounded-lg bg-surface-700/30 p-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isLevelDone ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <BookOpen className="h-4 w-4 text-text-muted" />
                      )}
                      <span className={`text-sm font-medium ${isLevelDone ? "text-green-400" : "text-text-primary"}`}>
                        Level {level.levelOrder}: {level.levelTitle}
                      </span>
                    </div>
                    <span className="text-xs text-text-muted">
                      {completed}/{level.lessonCount}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-700">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isLevelDone ? "bg-green-500" : "bg-accent-500"}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
