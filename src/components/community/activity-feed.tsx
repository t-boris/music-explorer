"use client";

import {
  CheckCircle,
  ClipboardCheck,
  Mic,
  BookOpen,
  ArrowUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ActivityEvent } from "@/types/index";

// ─── Relative time formatting ───

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

// ─── Event type icons ───

const eventIcons: Record<ActivityEvent["type"], React.ReactNode> = {
  exercise_completed: <CheckCircle className="h-4 w-4 text-green-400" />,
  test_completed: <ClipboardCheck className="h-4 w-4 text-blue-400" />,
  recording_created: <Mic className="h-4 w-4 text-red-400" />,
  session_logged: <BookOpen className="h-4 w-4 text-yellow-400" />,
  level_up: <ArrowUp className="h-4 w-4 text-accent-400" />,
};

// ─── Skeleton loader ───

function SkeletonCard() {
  return (
    <div className="flex items-start gap-3 px-1 py-3">
      <div className="h-8 w-8 animate-pulse rounded-full bg-surface-700" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-3/4 animate-pulse rounded bg-surface-700" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-surface-700" />
      </div>
    </div>
  );
}

// ─── Initials helper ───

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Component ───

interface ActivityFeedProps {
  events: ActivityEvent[];
  loading: boolean;
}

export function ActivityFeed({ events, loading }: ActivityFeedProps) {
  if (loading) {
    return (
      <Card className="border-border bg-surface-800">
        <CardContent>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="border-border bg-surface-800">
        <CardContent>
          <p className="text-sm text-text-muted">
            No recent activity from your connections.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-surface-800">
      <CardContent className="divide-y divide-border">
        {events.map((event) => {
          const createdAt = event.createdAt?.toDate?.()
            ? event.createdAt.toDate()
            : new Date();
          const initials = getInitials(event.userDisplayName);

          return (
            <div key={event.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              {/* Avatar */}
              {event.userPhotoURL ? (
                <img
                  src={event.userPhotoURL}
                  alt={event.userDisplayName}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-600 text-xs font-bold text-text-primary">
                  {initials}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {eventIcons[event.type]}
                  <span className="truncate text-sm font-medium text-text-primary">
                    {event.userDisplayName}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-text-secondary">
                  {event.title}
                </p>
              </div>

              {/* Time */}
              <span className="flex-shrink-0 text-xs text-text-muted">
                {timeAgo(createdAt)}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
