"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getActiveInviteLink,
  createInviteLink,
  getMyConnections,
  getConnectionsToMe,
  removeConnection as removeConnectionService,
} from "@/lib/connection-service";
import type { Connection, InviteLink } from "@/types/index";

interface UseConnectionsResult {
  inviteLink: InviteLink | null;
  connectionsToMe: Connection[];
  myConnections: Connection[];
  loading: boolean;
  generateInvite: () => Promise<void>;
  removeConnection: (connectionId: string) => Promise<void>;
}

export function useConnections(
  userId: string | undefined
): UseConnectionsResult {
  const [inviteLink, setInviteLink] = useState<InviteLink | null>(null);
  const [connectionsToMe, setConnectionsToMe] = useState<Connection[]>([]);
  const [myConnections, setMyConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setInviteLink(null);
      setConnectionsToMe([]);
      setMyConnections([]);
      setLoading(false);
      return;
    }

    async function fetchAll() {
      try {
        const [link, toMe, mine] = await Promise.all([
          getActiveInviteLink(userId!),
          getConnectionsToMe(userId!),
          getMyConnections(userId!),
        ]);
        setInviteLink(link);
        setConnectionsToMe(toMe);
        setMyConnections(mine);
      } catch (err) {
        console.error("Failed to load connections:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [userId]);

  const generateInvite = useCallback(async () => {
    if (!userId) return;
    const code = await createInviteLink(userId, "");
    // Re-fetch the invite link to get the full InviteLink object
    const link = await getActiveInviteLink(userId);
    setInviteLink(link);
  }, [userId]);

  const removeConnection = useCallback(
    async (connectionId: string) => {
      await removeConnectionService(connectionId);
      setConnectionsToMe((prev) =>
        prev.filter((c) => c.id !== connectionId)
      );
      setMyConnections((prev) =>
        prev.filter((c) => c.id !== connectionId)
      );
    },
    []
  );

  return {
    inviteLink,
    connectionsToMe,
    myConnections,
    loading,
    generateInvite,
    removeConnection,
  };
}
