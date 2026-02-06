"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getPracticeSession } from "@/lib/practice-service";
import { SessionForm } from "@/components/practice/session-form";
import type { PracticeSession, Exercise, Level } from "@/types/index";

interface EditSessionClientProps {
  sessionId: string;
  exercises: Exercise[];
  levels: Level[];
}

export function EditSessionClient({
  sessionId,
  exercises,
  levels,
}: EditSessionClientProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [session, setSession] = useState<PracticeSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (!user || !sessionId) return;

    async function loadSession() {
      try {
        const data = await getPracticeSession(user!.uid, sessionId);
        if (!data) {
          setError("Session not found.");
        } else {
          setSession(data);
        }
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

  if (authLoading || loading) {
    return (
      <div className="rounded-xl border border-surface-700 bg-surface-800 p-6">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-surface-700" />
          <div className="h-10 animate-pulse rounded bg-surface-700" />
          <div className="h-10 animate-pulse rounded bg-surface-700" />
          <div className="h-24 animate-pulse rounded bg-surface-700" />
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
        <p className="text-sm text-red-400">{error ?? "Session not found."}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-6">
      <SessionForm
        exercises={exercises}
        levels={levels}
        session={session}
      />
    </div>
  );
}
