"use client";

import { useEffect, useState } from "react";
import { getActivityFeed } from "@/lib/activity-service";
import type { ActivityEvent } from "@/types/index";

interface UseActivityFeedResult {
  events: ActivityEvent[];
  loading: boolean;
}

export function useActivityFeed(userIds: string[]): UseActivityFeedResult {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userIds.length === 0) {
      setEvents([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await getActivityFeed(userIds);
        if (!cancelled) {
          setEvents(result);
        }
      } catch {
        if (!cancelled) {
          setEvents([]);
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
  }, [userIds.join(",")]);

  return { events, loading };
}
