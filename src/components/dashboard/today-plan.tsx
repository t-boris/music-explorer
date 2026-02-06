"use client";

import Link from "next/link";
import { Clock, Play, BookOpen } from "lucide-react";
import type { PracticeSession, User } from "@/types/index";

interface TodayPlanProps {
  todaySession: PracticeSession | null;
  user: User | null;
}

export function TodayPlan({ todaySession, user }: TodayPlanProps) {
  const currentLevel = user?.currentLevel ?? 0;

  return (
    <div className="rounded-xl border-l-4 border-l-accent-500 border border-surface-700 bg-surface-800 p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-heading text-text-primary">
        <BookOpen className="h-5 w-5 text-accent-400" />
        Today&apos;s Practice
      </h2>

      {todaySession ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Clock className="h-4 w-4" />
            <span>{todaySession.durationMinutes} min practiced</span>
          </div>

          {todaySession.exerciseIds.length > 0 && (
            <p className="text-sm text-text-muted">
              {todaySession.exerciseIds.length} exercise
              {todaySession.exerciseIds.length !== 1 ? "s" : ""} completed
            </p>
          )}

          {todaySession.notes && (
            <p className="text-sm text-text-muted line-clamp-2">
              {todaySession.notes}
            </p>
          )}

          <Link
            href={`/practice/${todaySession.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent-500/10 px-3 py-1.5 text-sm font-medium text-accent-400 transition-colors hover:bg-accent-500/20"
          >
            <Play className="h-3.5 w-3.5" />
            Continue Session
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-text-muted">
            No practice logged today. Start a session to keep your streak going!
          </p>

          <p className="text-xs text-text-muted">
            Current level: <span className="text-text-secondary">Level {currentLevel}</span>
          </p>

          <Link
            href="/practice/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-surface-900 transition-colors hover:bg-accent-400"
          >
            <Play className="h-3.5 w-3.5" />
            Start Today&apos;s Session
          </Link>
        </div>
      )}
    </div>
  );
}
