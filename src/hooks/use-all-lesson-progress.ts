"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getAllLessonProgress } from "@/lib/lesson-progress-service";
import type { LessonProgress } from "@/types/index";

interface UseAllLessonProgressResult {
  progressByLesson: Map<string, LessonProgress>;
  loading: boolean;
}

export function useAllLessonProgress(): UseAllLessonProgressResult {
  const { user } = useAuth();
  const [progressByLesson, setProgressByLesson] = useState<Map<string, LessonProgress>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProgressByLesson(new Map());
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetch() {
      try {
        const all = await getAllLessonProgress(user!.uid);
        if (!cancelled) {
          const map = new Map<string, LessonProgress>();
          for (const p of all) {
            map.set(p.id, p); // id is "levelId_lessonId"
          }
          setProgressByLesson(map);
        }
      } catch (err) {
        console.error("Failed to fetch all lesson progress:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setLoading(true);
    fetch();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { progressByLesson, loading };
}
