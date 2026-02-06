"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";
import type { Lesson } from "@/types/index";

interface LessonCardProps {
  lesson: Lesson;
  index: number;
}

export function LessonCard({ lesson, index }: LessonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/levels/${lesson.levelId}/lessons/${lesson.id}`}
        className="block"
      >
        <Card className="border border-surface-700 bg-surface-800 transition-colors hover:border-accent-500/40 hover:bg-surface-700">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-500/15 font-heading text-lg font-bold text-accent-400">
                {lesson.order}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="font-heading text-base text-text-primary">
                  {lesson.title}
                </CardTitle>
                {lesson.tags.length > 0 && (
                  <CardDescription className="mt-1.5">
                    <span className="flex flex-wrap gap-1.5">
                      {lesson.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-surface-700 px-2 py-0.5 text-xs font-medium text-text-secondary"
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      </Link>
    </motion.div>
  );
}
