"use client";

import Link from "next/link";
import { Clock, Music, Calendar, Mic } from "lucide-react";
import type { PracticeSession } from "@/types/index";

// --- Helpers ---

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 7) return "This Week";
  if (diffDays < 14) return "Last Week";
  if (diffDays < 30) return "This Month";
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function groupSessionsByWeek(
  sessions: PracticeSession[]
): Map<string, PracticeSession[]> {
  const groups = new Map<string, PracticeSession[]>();
  for (const session of sessions) {
    const key = getWeekKey(session.date);
    const existing = groups.get(key) ?? [];
    existing.push(session);
    groups.set(key, existing);
  }
  return groups;
}

function totalMinutes(sessions: PracticeSession[]): number {
  return sessions.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

// --- Component ---

interface SessionHistoryProps {
  sessions: PracticeSession[];
}

export function SessionHistory({ sessions }: SessionHistoryProps) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-surface-700 bg-surface-800 p-8 text-center">
        <Calendar className="mb-3 h-10 w-10 text-accent-400/50" />
        <h3 className="text-lg font-heading text-text-primary">
          Session History
        </h3>
        <p className="mt-2 max-w-xs text-sm text-text-secondary">
          No practice sessions yet. Start a session to see your history here!
        </p>
      </div>
    );
  }

  const total = totalMinutes(sessions);
  const grouped = groupSessionsByWeek(sessions);

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-heading text-text-primary">
          Session History
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-accent-400">
          <Clock className="h-4 w-4" />
          <span className="font-medium">{formatDuration(total)} total</span>
        </div>
      </div>

      <div className="space-y-5">
        {Array.from(grouped.entries()).map(([groupLabel, groupSessions]) => (
          <div key={groupLabel}>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
              {groupLabel}
            </h4>
            <div className="space-y-2">
              {groupSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/practice/${session.id}`}
                  className="flex items-center gap-3 rounded-lg border border-surface-700 bg-surface-900/40 p-3 transition-colors hover:border-accent-500/30 hover:bg-surface-700/50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-700 text-text-muted">
                    <Mic className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      {formatDate(session.date)}
                    </p>
                    {session.notes && (
                      <p className="mt-0.5 truncate text-xs text-text-muted">
                        {session.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {session.durationMinutes}m
                    </span>
                    {session.exerciseIds.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Music className="h-3 w-3" />
                        {session.exerciseIds.length}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
