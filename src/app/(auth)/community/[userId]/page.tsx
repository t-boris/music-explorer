"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  ShieldX,
  Music,
  ClipboardCheck,
  CheckCircle,
  BookOpen,
} from "lucide-react";
import { useSharedDashboard } from "@/hooks/use-shared-dashboard";
import { StreakDisplay } from "@/components/dashboard/streak-display";
import { ProgressOverview } from "@/components/dashboard/progress-overview";
import { CommentAccordion } from "@/components/community/comment-accordion";
import type {
  PracticeSession,
  Recording,
  TestAttempt,
  ExerciseCompletion,
} from "@/types/index";

// ─── Item Cards ───

function SessionCard({
  session,
  targetUserId,
}: {
  session: PracticeSession;
  targetUserId: string;
}) {
  const date = session.date ?? "Unknown date";
  return (
    <div className="rounded-lg border border-surface-700 bg-surface-800 p-4">
      <div className="flex items-start gap-3">
        <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-400" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">
            {session.durationMinutes} min practice session
          </p>
          <p className="text-xs text-text-muted">{date}</p>
          {session.notes && (
            <p className="mt-1 text-xs text-text-secondary line-clamp-2">
              {session.notes}
            </p>
          )}
        </div>
      </div>
      <CommentAccordion
        targetUserId={targetUserId}
        targetType="practice_session"
        targetId={session.id}
      />
    </div>
  );
}

function RecordingCard({
  recording,
  targetUserId,
}: {
  recording: Recording;
  targetUserId: string;
}) {
  const date = recording.createdAt?.toDate
    ? recording.createdAt.toDate().toLocaleDateString()
    : "Unknown date";

  return (
    <div className="rounded-lg border border-surface-700 bg-surface-800 p-4">
      <div className="flex items-start gap-3">
        <Music className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-400" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">
            {recording.contextTitle || "Recording"}
          </p>
          <p className="text-xs text-text-muted">
            {date} &middot; {Math.round(recording.duration)}s
          </p>
        </div>
      </div>
      <CommentAccordion
        targetUserId={targetUserId}
        targetType="recording"
        targetId={recording.id}
      />
    </div>
  );
}

function TestAttemptCard({
  attempt,
  targetUserId,
}: {
  attempt: TestAttempt;
  targetUserId: string;
}) {
  const date = attempt.completedAt?.toDate
    ? attempt.completedAt.toDate().toLocaleDateString()
    : "Unknown date";
  const pct = attempt.totalQuestions > 0
    ? Math.round((attempt.score / attempt.totalQuestions) * 100)
    : 0;

  return (
    <div className="rounded-lg border border-surface-700 bg-surface-800 p-4">
      <div className="flex items-start gap-3">
        <ClipboardCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-400" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">
            {attempt.testTitle}
          </p>
          <p className="text-xs text-text-muted">
            {date} &middot; {attempt.score}/{attempt.totalQuestions} ({pct}%)
          </p>
        </div>
      </div>
      <CommentAccordion
        targetUserId={targetUserId}
        targetType="test_attempt"
        targetId={attempt.id}
      />
    </div>
  );
}

function ExerciseCompletionCard({
  completion,
  targetUserId,
}: {
  completion: ExerciseCompletion;
  targetUserId: string;
}) {
  const date = completion.completedAt?.toDate
    ? completion.completedAt.toDate().toLocaleDateString()
    : "Unknown date";

  return (
    <div className="rounded-lg border border-surface-700 bg-surface-800 p-4">
      <div className="flex items-start gap-3">
        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-400" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">
            {completion.exerciseTitle}
          </p>
          <p className="text-xs text-text-muted">{date}</p>
        </div>
      </div>
      <CommentAccordion
        targetUserId={targetUserId}
        targetType="exercise_completion"
        targetId={completion.id}
      />
    </div>
  );
}

// ─── Main Page ───

export default function SharedDashboardPage() {
  const params = useParams<{ userId: string }>();
  const targetUserId = params.userId;
  const { data, loading, error, authorized } = useSharedDashboard(targetUserId);

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
        <p className="mt-3 text-sm text-text-muted">Loading dashboard...</p>
      </main>
    );
  }

  if (!authorized || error === "Not connected") {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/community"
          className="mb-6 inline-flex items-center gap-1 text-sm text-accent-400 hover:text-accent-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Community
        </Link>

        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface-800 px-6 py-16 text-center">
          <ShieldX className="mb-4 h-12 w-12 text-text-muted" />
          <h2 className="text-lg font-semibold text-text-primary">
            Access Denied
          </h2>
          <p className="mt-2 max-w-md text-sm text-text-muted">
            You don&apos;t have access to this dashboard. Ask them to share
            their invite link with you.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
        <p className="text-sm text-red-400">{error}</p>
        <p className="mt-1 text-xs text-text-muted">
          Try refreshing the page.
        </p>
      </main>
    );
  }

  const dashboard = data?.dashboard;
  const displayName = data?.targetDisplayName ?? "User";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/community"
        className="mb-6 inline-flex items-center gap-1 text-sm text-accent-400 hover:text-accent-300 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Community
      </Link>

      {/* Header */}
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-text-primary">
          {displayName}&apos;s Dashboard
        </h1>
      </header>

      {/* Streak & Progress — 2 col grid */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <StreakDisplay
          currentStreak={dashboard?.currentStreak ?? 0}
          totalMinutes={dashboard?.totalMinutes ?? 0}
          weeklyMinutes={dashboard?.weeklyMinutes ?? 0}
        />
        <ProgressOverview user={dashboard?.user ?? null} />
      </div>

      {/* Recent Practice Sessions */}
      {data?.sessions && data.sessions.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Recent Practice Sessions
          </h2>
          <div className="space-y-3">
            {data.sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                targetUserId={targetUserId}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Recordings */}
      {data?.recordings && data.recordings.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Recent Recordings
          </h2>
          <div className="space-y-3">
            {data.recordings.map((recording) => (
              <RecordingCard
                key={recording.id}
                recording={recording}
                targetUserId={targetUserId}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Test Results */}
      {data?.testAttempts && data.testAttempts.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Recent Test Results
          </h2>
          <div className="space-y-3">
            {data.testAttempts.map((attempt) => (
              <TestAttemptCard
                key={attempt.id}
                attempt={attempt}
                targetUserId={targetUserId}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Exercise Completions */}
      {data?.exerciseCompletions && data.exerciseCompletions.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Recent Exercise Completions
          </h2>
          <div className="space-y-3">
            {data.exerciseCompletions.map((completion) => (
              <ExerciseCompletionCard
                key={completion.id}
                completion={completion}
                targetUserId={targetUserId}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
