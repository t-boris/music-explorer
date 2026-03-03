"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Music, Pencil, Trash2, Mic, GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  getPracticeSession,
  deletePracticeSession,
} from "@/lib/practice-service";
import { AudioRecorder } from "@/components/recording/audio-recorder";
import { RecordingList } from "@/components/recording/recording-list";
import { RecordingComparison } from "@/components/recording/recording-comparison";
import { useSessionRecordings } from "@/hooks/use-recordings";
import { CommentSection } from "@/components/community/comment-section";
import type { PracticeSession } from "@/types/index";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user, loading: authLoading, error: authError } = useAuth();
  const router = useRouter();

  const [session, setSession] = useState<PracticeSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const {
    recordings,
    loading: recordingsLoading,
  } = useSessionRecordings(user?.uid, sessionId);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (!user || !sessionId) return;

    async function loadSession() {
      try {
        const data = await getPracticeSession(user!.uid, sessionId);
        setSession(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load session."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [user, authLoading, sessionId, router]);

  async function handleDelete() {
    if (!user || !session) return;
    setDeleting(true);
    try {
      await deletePracticeSession(user.uid, session.id);
      router.push("/practice");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete session."
      );
      setDeleting(false);
    }
  }

  if (authLoading || loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="space-y-4">
          <div className="h-6 w-32 animate-pulse rounded bg-surface-700" />
          <div className="h-8 w-64 animate-pulse rounded bg-surface-700" />
          <div className="h-40 animate-pulse rounded-xl bg-surface-700" />
        </div>
      </main>
    );
  }

  if (authError) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
        <p className="text-sm text-red-400">{authError}</p>
        <p className="mt-1 text-xs text-text-muted">
          Try refreshing the page.
        </p>
      </main>
    );
  }

  if (!user) return null;

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/practice"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Practice
        </Link>
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/practice"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Practice
        </Link>
        <div className="rounded-xl border border-surface-700 bg-surface-800 p-6 text-center">
          <p className="text-text-secondary">Session not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-text-muted">
        <Link
          href="/practice"
          className="transition-colors hover:text-text-primary"
        >
          Practice
        </Link>
        <span>/</span>
        <span className="text-text-secondary">
          Session {formatShortDate(session.date)}
        </span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading text-text-primary">
            <Calendar className="mr-2 inline h-6 w-6 text-accent-400" />
            {formatDate(session.date)}
          </h1>
        </div>
      </div>

      {/* Session details card */}
      <div className="space-y-6">
        {/* Duration + Metadata */}
        <div className="rounded-xl border border-surface-700 bg-surface-800 p-6">
          <div className="flex flex-wrap items-center gap-6 text-sm text-text-secondary">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent-400" />
              {session.durationMinutes} minutes
            </span>
            {session.exerciseIds.length > 0 && (
              <span className="flex items-center gap-2">
                <Music className="h-4 w-4 text-accent-400" />
                {session.exerciseIds.length}{" "}
                {session.exerciseIds.length === 1 ? "exercise" : "exercises"}
              </span>
            )}
          </div>

          {/* Notes */}
          {session.notes && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-medium text-text-muted">
                Notes
              </h2>
              <p className="whitespace-pre-wrap text-sm text-text-primary leading-relaxed">
                {session.notes}
              </p>
            </div>
          )}

          {/* Linked exercises */}
          {session.exerciseIds.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-medium text-text-muted">
                Exercises
              </h2>
              <div className="flex flex-wrap gap-2">
                {session.exerciseIds.map((exId) => (
                  <span
                    key={exId}
                    className="rounded-full border border-surface-600 bg-surface-700 px-3 py-1 text-xs text-text-secondary"
                  >
                    {exId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recordings Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-medium text-text-secondary">
              <Mic className="h-4 w-4 text-accent-400" />
              Recordings
            </h2>
            {recordings.length >= 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComparison((v) => !v)}
                className="text-xs text-text-muted hover:text-accent-400"
              >
                <GitCompareArrows className="mr-1 h-3.5 w-3.5" />
                {showComparison ? "Hide Comparison" : "Compare"}
              </Button>
            )}
          </div>

          {/* Recorder widget */}
          <AudioRecorder
            userId={user.uid}
            contextType="free"
            contextId={session.id}
            contextTitle={`Session ${formatShortDate(session.date)}`}
            levelId={session.levelId}
            sessionId={session.id}
          />

          {/* Recording list */}
          <div className="mt-4">
            <RecordingList
              recordings={recordings}
              userId={user.uid}
              loading={recordingsLoading}
            />
          </div>

          {/* Comparison view */}
          {showComparison && recordings.length >= 2 && (
            <div className="mt-4">
              <RecordingComparison recordings={recordings} />
            </div>
          )}
        </div>

        {/* Session Comments */}
        <div className="rounded-xl border border-surface-700 bg-surface-800 p-6">
          <h2 className="mb-3 text-sm font-medium text-text-secondary">
            Session Comments
          </h2>
          <CommentSection
            targetUserId={user.uid}
            targetType="practice_session"
            targetId={session.id}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            asChild
          >
            <Link href="/practice">
              <ArrowLeft className="h-4 w-4" />
              Back to Practice
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href={`/practice/${sessionId}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
          <div className="ml-auto">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-400">Delete this session?</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Confirm"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setConfirmDelete(true)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
