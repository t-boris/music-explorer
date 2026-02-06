"use client";

import { Loader2 } from "lucide-react";
import { useDashboard } from "@/hooks/use-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { TodayPlan } from "@/components/dashboard/today-plan";
import { QuickRecord } from "@/components/dashboard/quick-record";
import { StreakDisplay } from "@/components/dashboard/streak-display";
import { ProgressOverview } from "@/components/dashboard/progress-overview";
import { StaffReference } from "@/components/dashboard/staff-reference";
import { NoteExplorer } from "@/components/dashboard/note-explorer";

export default function DashboardPage() {
  const { user: authUser, loading: authLoading, error: authError } = useAuth();
  const { data, loading, error } = useDashboard();

  const displayName =
    data?.user?.displayName ?? authUser?.displayName ?? "Musician";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (authLoading || loading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
        <p className="mt-3 text-sm text-text-muted">Loading dashboard...</p>
      </main>
    );
  }

  if (authError || error) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
        <p className="text-sm text-red-400">{authError || error}</p>
        <p className="mt-1 text-xs text-text-muted">
          Try refreshing the page.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Greeting */}
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-text-primary">
          Welcome back, {displayName}
        </h1>
        <p className="mt-1 text-sm text-text-muted">{today}</p>
      </header>

      {/* Widget Grid — 2 col desktop, 1 col mobile */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Plan */}
        <TodayPlan
          todaySession={data?.todaySession ?? null}
          user={data?.user ?? null}
        />

        {/* Streak Display */}
        <StreakDisplay
          currentStreak={data?.currentStreak ?? 0}
          totalMinutes={data?.totalMinutes ?? 0}
          weeklyMinutes={data?.weeklyMinutes ?? 0}
        />

        {/* Quick Record */}
        {authUser?.uid && <QuickRecord userId={authUser.uid} />}

        {/* Progress Overview */}
        <ProgressOverview user={data?.user ?? null} />

        {/* Staff Quick Reference */}
        <StaffReference />

        {/* Note Explorer */}
        <NoteExplorer />
      </div>
    </main>
  );
}
