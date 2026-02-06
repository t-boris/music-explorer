"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Loader2, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useConnections } from "@/hooks/use-connections";
import { useActivityFeed } from "@/hooks/use-activity-feed";
import { PeopleList } from "@/components/community/people-list";
import { ActivityFeed } from "@/components/community/activity-feed";

export default function CommunityPage() {
  const { user, loading: authLoading } = useAuth();
  const { myConnections, loading: connectionsLoading } = useConnections(
    user?.uid
  );

  // Extract connected user IDs from myConnections (people who shared with me)
  const connectedUserIds = useMemo(
    () => myConnections.map((c) => c.fromUserId),
    [myConnections]
  );

  const { events, loading: feedLoading } = useActivityFeed(connectedUserIds);

  const loading = authLoading || connectionsLoading;

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-400" />
        <p className="mt-3 text-sm text-text-muted">Loading community...</p>
      </main>
    );
  }

  // Empty state when no connections
  if (!connectionsLoading && myConnections.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-text-primary">
            Community
          </h1>
        </header>

        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface-800 px-6 py-16 text-center">
          <Users className="mb-4 h-12 w-12 text-text-muted" />
          <h2 className="text-lg font-semibold text-text-primary">
            No connections yet
          </h2>
          <p className="mt-2 max-w-md text-sm text-text-muted">
            Connect with friends, teachers, and fellow musicians. Share your
            invite link or ask someone to share theirs with you.
          </p>
          <Link
            href="/share"
            className="mt-6 inline-flex items-center rounded-md bg-accent-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-600"
          >
            Share your invite link
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-text-primary">
          Community
        </h1>
      </header>

      {/* People List */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Connected People
        </h2>
        <PeopleList connections={myConnections} />
      </section>

      {/* Activity Feed */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Recent Activity
        </h2>
        <ActivityFeed events={events} loading={feedLoading} />
      </section>
    </main>
  );
}
