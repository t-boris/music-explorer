"use client";

import { useState } from "react";
import { BookCheck, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLessonProgress } from "@/hooks/use-lesson-progress";

interface LessonProgressSectionProps {
  levelId: string;
  lessonId: string;
  totalExercises: number;
  totalLessonsInLevel: number;
}

export function LessonProgressSection({
  levelId,
  lessonId,
  totalExercises,
  totalLessonsInLevel,
}: LessonProgressSectionProps) {
  const { user } = useAuth();
  const { contentRead, completed, loading, markAsRead } = useLessonProgress(
    levelId,
    lessonId,
    totalExercises,
    totalLessonsInLevel
  );
  const [marking, setMarking] = useState(false);

  // Not shown for unauthenticated users
  if (!user) return null;

  if (loading) {
    return (
      <div className="my-6 flex items-center gap-2 rounded-lg border border-surface-700 bg-surface-800 px-4 py-3">
        <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
        <span className="text-sm text-text-muted">Loading progress...</span>
      </div>
    );
  }

  // Lesson fully completed
  if (completed) {
    return (
      <div className="my-6 flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/20">
          <BookCheck className="h-4 w-4 text-green-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-green-400">Lesson Complete</p>
          <p className="text-xs text-green-400/70">
            Content read and all exercises completed.
          </p>
        </div>
      </div>
    );
  }

  // Content already read, exercises pending
  if (contentRead) {
    return (
      <div className="my-6 flex items-center gap-3 rounded-lg border border-accent-500/30 bg-accent-500/10 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-500/20">
          <Check className="h-4 w-4 text-accent-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-accent-400">Content Read</p>
          <p className="text-xs text-text-muted">
            Complete all exercises below to finish this lesson.
          </p>
        </div>
      </div>
    );
  }

  // Content not read yet
  return (
    <div className="my-6 flex items-center justify-between rounded-lg border border-surface-700 bg-surface-800 px-4 py-3">
      <p className="text-sm text-text-secondary">
        Finished reading? Mark the content as read to track your progress.
      </p>
      <button
        onClick={async () => {
          setMarking(true);
          try {
            await markAsRead();
          } finally {
            setMarking(false);
          }
        }}
        disabled={marking}
        className="ml-3 inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent-500 px-3 py-1.5 text-sm font-medium text-surface-900 transition-colors hover:bg-accent-600 disabled:opacity-50"
      >
        {marking ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <BookCheck className="h-3.5 w-3.5" />
        )}
        Mark as Read
      </button>
    </div>
  );
}
