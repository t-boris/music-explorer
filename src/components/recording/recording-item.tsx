"use client";

import { useState } from "react";
import { Trash2, Pencil, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecordingPlayer } from "@/components/recording/recording-player";
import { CommentAccordion } from "@/components/community/comment-accordion";
import { deleteRecording, updateRecording } from "@/lib/recording-service";
import type { Recording } from "@/types/index";

function formatRecordingDate(recording: Recording): string {
  if (!recording.createdAt) return "Just now";
  const date =
    "toDate" in recording.createdAt
      ? recording.createdAt.toDate()
      : new Date(recording.createdAt as unknown as string);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface RecordingItemProps {
  recording: Recording;
  userId: string;
  showComments?: boolean;
  showDate?: boolean;
  onUpdated?: () => void;
}

export function RecordingItem({
  recording,
  userId,
  showComments = true,
  showDate = false,
  onUpdated,
}: RecordingItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState(recording.title ?? "");
  const [editNotes, setEditNotes] = useState(recording.notes ?? "");

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteRecording(userId, recording.id, recording.storageUrl);
    } catch (err) {
      console.error("Failed to delete recording:", err);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function handleSaveEdit() {
    setSaving(true);
    try {
      await updateRecording(userId, recording.id, {
        title: editTitle || undefined,
        notes: editNotes || undefined,
      });
      recording.title = editTitle || undefined;
      recording.notes = editNotes || undefined;
      setEditing(false);
      onUpdated?.();
    } catch (err) {
      console.error("Failed to update recording:", err);
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setEditTitle(recording.title ?? "");
    setEditNotes(recording.notes ?? "");
    setEditing(false);
  }

  const displayTitle = recording.title || recording.contextTitle;

  return (
    <div className="group">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <RecordingPlayer
            downloadUrl={recording.downloadUrl}
            duration={recording.duration}
            title={displayTitle}
            compact
          />
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="h-8 px-2 text-xs text-red-400 hover:text-red-300"
              >
                {deleting ? "..." : "Yes"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(false)}
                className="h-8 px-2 text-xs text-text-muted"
              >
                No
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(true)}
                className="h-8 w-8 p-0 text-text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-accent-400"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                className="h-8 w-8 p-0 text-text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {editing && (
        <div className="mt-2 space-y-2 rounded-lg border border-surface-600 bg-surface-800 p-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Recording title"
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

      {!editing && recording.notes && (
        <p className="mt-1 pl-1 text-xs text-text-muted">
          {recording.notes}
        </p>
      )}

      {showDate && (
        <p className="mt-1 pl-1 text-xs text-text-muted">
          {formatRecordingDate(recording)}
        </p>
      )}
      {showComments && (
        <CommentAccordion
          targetUserId={userId}
          targetType="recording"
          targetId={recording.id}
        />
      )}
    </div>
  );
}
