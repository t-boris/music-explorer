"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getMyConnections } from "@/lib/connection-service";
import { getDashboardData } from "@/lib/dashboard-service";
import { getSessionHistory } from "@/lib/progress-service";
import { getRecordings } from "@/lib/recording-service";
import { getTestAttempts } from "@/lib/test-service";
import { getCompletionsForAllLessons } from "@/lib/exercise-service";
import type {
  DashboardData,
  PracticeSession,
  Recording,
  TestAttempt,
  ExerciseCompletion,
} from "@/types/index";

interface SharedDashboardData {
  dashboard: DashboardData | null;
  sessions: PracticeSession[];
  recordings: Recording[];
  testAttempts: TestAttempt[];
  exerciseCompletions: ExerciseCompletion[];
  targetDisplayName: string;
}

interface UseSharedDashboardResult {
  data: SharedDashboardData | null;
  loading: boolean;
  error: string | null;
  authorized: boolean;
}

export function useSharedDashboard(
  targetUserId: string
): UseSharedDashboardResult {
  const { user } = useAuth();
  const [data, setData] = useState<SharedDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!user?.uid || !targetUserId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // 1. Verify connection exists
        const connections = await getMyConnections(user!.uid);
        const isConnected = connections.some(
          (c) => c.fromUserId === targetUserId
        );

        if (!isConnected) {
          if (!cancelled) {
            setAuthorized(false);
            setError("Not connected");
            setLoading(false);
          }
          return;
        }

        if (!cancelled) {
          setAuthorized(true);
        }

        // 2. Fetch dashboard data and commentable items in parallel
        const [dashboard, sessions, recordings, testAttempts, exerciseCompletions] =
          await Promise.all([
            getDashboardData(targetUserId),
            getSessionHistory(targetUserId, 20),
            getRecordings(targetUserId),
            getTestAttempts(targetUserId),
            getCompletionsForAllLessons(targetUserId),
          ]);

        const targetDisplayName =
          dashboard.user?.displayName ?? "User";

        if (!cancelled) {
          setData({
            dashboard,
            sessions,
            recordings,
            testAttempts,
            exerciseCompletions,
            targetDisplayName,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load shared dashboard."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [user?.uid, targetUserId]);

  return { data, loading, error, authorized };
}
