"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Music, ChevronDown, ChevronRight, Mic, Loader2, Pencil, Check, X } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecordingItem } from "@/components/recording/recording-item";
import { CommentAccordion } from "@/components/community/comment-accordion";
import { useSessionRecordings } from "@/hooks/use-recordings";
import { updatePracticeSession } from "@/lib/practice-service";
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
  userId: string;
}

export function SessionCard({ session, userId }: SessionCardProps) {
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
    <Card className="group/card border border-surface-700 bg-surface-800 transition-colors hover:border-accent-500/30">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex-shrink-0 text-text-muted hover:text-text-secondary transition-colors"
                aria-label={expanded ? "Collapse session" : "Expand session"}
              >
                {expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
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
            {session.notes && !editing && (
              <p className="mt-1 pl-6 text-sm text-text-secondary line-clamp-2">
                {session.notes}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(true)}
            className="h-8 w-8 p-0 text-text-muted opacity-0 transition-opacity group-hover/card:opacity-100 hover:text-accent-400"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {editing && (
          <div className="mb-3 space-y-2 rounded-lg border border-surface-600 bg-surface-800 p-3">
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

        {expanded && (
          <div className="mt-3 border-t border-surface-700 pt-3 space-y-3">
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
      </CardContent>
    </Card>
  );
}
