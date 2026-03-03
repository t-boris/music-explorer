"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Music, Calendar, Mic, ChevronDown, ChevronRight, Loader2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecordingItem } from "@/components/recording/recording-item";
import { CommentAccordion } from "@/components/community/comment-accordion";
import { useSessionRecordings } from "@/hooks/use-recordings";
import { updatePracticeSession } from "@/lib/practice-service";
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

// --- Expandable Session Row ---

function ExpandableSessionRow({
  session,
  userId,
}: {
  session: PracticeSession;
  userId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title ?? "");
  const [editNotes, setEditNotes] = useState(session.notes ?? "");

  const { recordings, loading: recordingsLoading } = useSessionRecordings(
    expanded ? userId : undefined,
    expanded ? session.id : undefined
  );

  async function handleSaveEdit() {
    setSaving(true);
    try {
      await updatePracticeSession(userId, session.id, {
        title: editTitle || undefined,
        notes: editNotes,
      });
      session.title = editTitle || undefined;
      session.notes = editNotes;
      setEditing(false);
    } catch (err) {
      console.error("Failed to update session:", err);
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setEditTitle(session.title ?? "");
    setEditNotes(session.notes ?? "");
    setEditing(false);
  }

  return (
    <div className="group/row rounded-lg border border-surface-700 bg-surface-900/40 transition-colors hover:border-accent-500/30">
      <div className="flex items-center gap-3 p-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-700 text-text-muted hover:text-text-secondary transition-colors"
          aria-label={expanded ? "Collapse session" : "Expand session"}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {session.title && (
              <span className="text-sm font-medium text-text-primary">
                {session.title}
              </span>
            )}
            <Link
              href={`/practice/${session.id}`}
              className="text-sm font-medium text-text-primary hover:text-accent-400 transition-colors"
            >
              {formatDate(session.date)}
            </Link>
          </div>
          {session.notes && (
            <p className="mt-0.5 truncate text-xs text-text-muted">
              {session.notes}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(true)}
            className="h-8 w-8 p-0 text-text-muted opacity-0 transition-opacity group-hover/row:opacity-100 hover:text-accent-400"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
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
        </div>
      </div>

      {editing && (
        <div className="mx-3 mb-3 space-y-2 rounded-lg border border-surface-600 bg-surface-800 p-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Session title"
            className="w-full rounded-md border border-surface-600 bg-surface-900 px-2.5 py-1.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-500"
          />
          <textarea
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            placeholder="Notes..."
            rows={2}
            className="w-full resize-y rounded-md border border-surface-600 bg-surface-900 px-2.5 py-1.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-500"
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSaveEdit}
              disabled={saving}
              className="h-7 gap-1.5 px-2.5 text-xs"
            >
              {saving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3" />
              )}
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              disabled={saving}
              className="h-7 gap-1.5 px-2.5 text-xs"
            >
              <X className="h-3 w-3" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="border-t border-surface-700 px-3 py-3 space-y-3">
          {/* Recordings */}
          {recordingsLoading ? (
            <div className="flex items-center gap-2 text-xs text-text-muted py-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading recordings...
            </div>
          ) : recordings.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                <Mic className="h-3.5 w-3.5" />
                Recordings ({recordings.length})
              </p>
              {recordings.map((recording) => (
                <RecordingItem
                  key={recording.id}
                  recording={recording}
                  userId={userId}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted py-1">No recordings for this session.</p>
          )}

          {/* Session-level comments */}
          <CommentAccordion
            targetUserId={userId}
            targetType="practice_session"
            targetId={session.id}
          />
        </div>
      )}
    </div>
  );
}

// --- Component ---

interface SessionHistoryProps {
  sessions: PracticeSession[];
  userId: string;
}

export function SessionHistory({ sessions, userId }: SessionHistoryProps) {
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
                <ExpandableSessionRow
                  key={session.id}
                  session={session}
                  userId={userId}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
