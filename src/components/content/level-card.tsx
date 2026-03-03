"use client";

import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";
import type { Level } from "@/types/index";

interface LevelCardProps {
  level: Level;
  isActive: boolean;
  lessonCount: number;
  completedLessons?: number;
}

export function LevelCard({ level, isActive, lessonCount, completedLessons }: LevelCardProps) {
  const content = (
    <Card
      className={`relative border transition-colors ${
        isActive
          ? "border-surface-700 bg-surface-800 hover:border-accent-500/40 hover:bg-surface-700"
          : "border-surface-700/50 bg-surface-800/50 opacity-60"
      }`}
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg font-heading text-xl font-bold ${
              isActive
                ? "bg-accent-500/15 text-accent-400"
                : "bg-surface-700/50 text-text-muted"
            }`}
          >
            {level.order}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle
                className={`font-heading text-lg ${
                  isActive ? "text-text-primary" : "text-text-muted"
                }`}
              >
                {level.title}
              </CardTitle>
              {!isActive && (
                <Lock className="h-4 w-4 shrink-0 text-text-muted" />
              )}
            </div>
            <CardDescription
              className={`mt-1 text-sm ${
                isActive ? "text-text-secondary" : "text-text-muted"
              }`}
            >
              {level.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          {level.skillFocus.map((skill) => (
            <span
              key={skill}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isActive
                  ? "bg-surface-700 text-text-secondary"
                  : "bg-surface-700/30 text-text-muted"
              }`}
            >
              {skill}
            </span>
          ))}
          {isActive && lessonCount > 0 && (
            <span className="ml-auto flex items-center gap-2 text-xs text-text-muted">
              {completedLessons != null && completedLessons >= lessonCount ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-400">
                  <Check className="h-3 w-3" />
                  Completed
                </span>
              ) : completedLessons != null && completedLessons > 0 ? (
                <span className="rounded-full bg-accent-500/15 px-2 py-0.5 text-xs font-medium text-accent-400">
                  {completedLessons}/{lessonCount} completed
                </span>
              ) : null}
              {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
            </span>
          )}
          {!isActive && (
            <span className="ml-auto text-xs italic text-text-muted">
              Coming soon
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!isActive) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: level.order * 0.04 }}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: level.order * 0.04 }}
    >
      <Link href={`/levels/${level.id}`} className="block">
        {content}
      </Link>
    </motion.div>
  );
}
