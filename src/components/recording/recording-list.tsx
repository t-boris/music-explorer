"use client";

import { useState } from "react";
import { Trash2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecordingPlayer } from "@/components/recording/recording-player";
import { deleteRecording } from "@/lib/recording-service";
import type { Recording } from "@/types/index";

interface RecordingListProps {
  recordings: Recording[];
  userId: string;
  loading?: boolean;
}

function formatRecordingDate(recording: Recording): string {
  if (!recording.createdAt) return "Just now";
  const date =
    "toDate" in recording.createdAt
      ? recording.createdAt.toDate()
      : new Date(recording.createdAt as unknown as string);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function RecordingList({
  recordings,
  userId,
  loading = false,
}: RecordingListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleDelete(recording: Recording) {
    setDeletingId(recording.id);
    try {
      await deleteRecording(userId, recording.id, recording.storageUrl);
    } catch (err) {
      console.error("Failed to delete recording:", err);
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-lg bg-surface-700"
          />
        ))}
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-surface-600 bg-surface-800/50 py-8 text-center">
        <Mic className="mx-auto h-6 w-6 text-text-muted" />
        <p className="mt-2 text-sm text-text-muted">No recordings yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recordings.map((rec) => (
        <div key={rec.id} className="group">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <RecordingPlayer
                downloadUrl={rec.downloadUrl}
                duration={rec.duration}
                title={rec.contextTitle}
                compact
              />
            </div>

            {/* Delete button */}
            <div className="shrink-0">
              {confirmId === rec.id ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(rec)}
                    disabled={deletingId === rec.id}
                    className="h-8 px-2 text-xs text-red-400 hover:text-red-300"
                  >
                    {deletingId === rec.id ? "..." : "Yes"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmId(null)}
                    className="h-8 px-2 text-xs text-text-muted"
                  >
                    No
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmId(rec.id)}
                  className="h-8 w-8 p-0 text-text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Date label */}
          <p className="mt-1 pl-1 text-xs text-text-muted">
            {formatRecordingDate(rec)}
          </p>
        </div>
      ))}
    </div>
  );
}
