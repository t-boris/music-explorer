"use client";

import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionCard } from "@/components/practice/session-card";
import { usePracticeSessions } from "@/hooks/use-practice-sessions";

interface SessionListProps {
  userId: string;
}

export function SessionList({ userId }: SessionListProps) {
  const { sessions, loading, error } = usePracticeSessions(userId);

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Loading skeleton */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[120px] animate-pulse rounded-xl border border-surface-700 bg-surface-800"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
        <p className="text-sm text-red-400">
          Failed to load sessions: {error}
        </p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border border-surface-700 bg-surface-800 px-6 py-12 text-center">
        <BookOpen className="mx-auto h-10 w-10 text-text-muted" />
        <p className="mt-4 text-lg font-heading text-text-primary">
          No practice sessions yet
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          Start your first session to track your progress!
        </p>
        <Button asChild className="mt-6">
          <Link href="/practice/new">
            <Plus className="h-4 w-4" />
            New Session
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} userId={userId} />
      ))}
    </div>
  );
}
