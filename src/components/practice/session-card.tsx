"use client";

import Link from "next/link";
import { Clock, Music } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { PracticeSession } from "@/types/index";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface SessionCardProps {
  session: PracticeSession;
}

export function SessionCard({ session }: SessionCardProps) {
  return (
    <Link href={`/practice/${session.id}`} className="block">
      <Card className="border border-surface-700 bg-surface-800 transition-colors hover:border-accent-500/30 hover:bg-surface-700/70">
        <CardHeader className="pb-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-primary">
                {formatDate(session.date)}
              </p>
              {session.notes && (
                <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                  {session.notes}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {session.durationMinutes} min
            </span>
            {session.exerciseIds.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Music className="h-3.5 w-3.5" />
                {session.exerciseIds.length}{" "}
                {session.exerciseIds.length === 1 ? "exercise" : "exercises"}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
