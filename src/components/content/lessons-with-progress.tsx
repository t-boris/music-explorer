"use client";

import { LessonCard } from "@/components/content/lesson-card";
import { useAllLessonProgress } from "@/hooks/use-all-lesson-progress";
import { useAuth } from "@/hooks/use-auth";
import type { Lesson } from "@/types/index";

interface LessonsWithProgressProps {
  lessons: Lesson[];
}

export function LessonsWithProgress({ lessons }: LessonsWithProgressProps) {
  const { user } = useAuth();
  const { progressByLesson, loading } = useAllLessonProgress();

  return (
    <div className="flex flex-col gap-3">
      {lessons.map((lesson, index) => {
        let progress: { contentRead: boolean; completed: boolean } | undefined;

        if (user && !loading) {
          const key = `${lesson.levelId}_${lesson.id}`;
          const lp = progressByLesson.get(key);
          if (lp) {
            progress = {
              contentRead: lp.contentReadAt != null,
              completed: lp.completedAt != null,
            };
          }
        }

        return (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            index={index}
            progress={progress}
          />
        );
      })}
    </div>
  );
}
