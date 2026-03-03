"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionList } from "@/components/practice/session-list";
import { QuickRecordingList } from "@/components/practice/quick-recording-list";
import { Metronome } from "@/components/practice/metronome";
import { TempoTrainer } from "@/components/practice/tempo-trainer";
import { useAuth } from "@/hooks/use-auth";

export default function PracticePage() {
  const { user, loading, error: authError } = useAuth();
  const [tempoTrainerOpen, setTempoTrainerOpen] = useState(false);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-surface-700" />
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

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-heading text-text-primary">
          Practice Journal
        </h1>
        <Button asChild>
          <Link href="/practice/new">
            <Plus className="h-4 w-4" />
            New Session
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left column: Session list + quick recordings */}
        <div className="space-y-6">
          <SessionList userId={user!.uid} />
          <QuickRecordingList userId={user!.uid} />
        </div>

        {/* Right column: Practice tools */}
        <aside className="space-y-6">
          <h2 className="text-lg font-heading text-text-secondary">
            Practice Tools
          </h2>

          {/* Metronome - always visible */}
          <Metronome />

          {/* Tempo Trainer - collapsible */}
          <div>
            <button
              onClick={() => setTempoTrainerOpen(!tempoTrainerOpen)}
              className="mb-3 flex w-full items-center gap-2 text-sm font-heading text-text-secondary hover:text-text-primary transition-colors"
            >
              {tempoTrainerOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              Tempo Training
            </button>
            {tempoTrainerOpen && <TempoTrainer userId={user!.uid} />}
          </div>
        </aside>
      </div>
    </main>
  );
}
