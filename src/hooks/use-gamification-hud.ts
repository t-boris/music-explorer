"use client";

import { useEffect, useState } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { getNextRank } from "@/lib/gamification-config";
import type { GamificationProfile } from "@/types/index";
import type { RankDefinition } from "@/lib/gamification-config";

interface UseGamificationHudResult {
  totalXp: number;
  rank: string;
  streakDays: number;
  nextRank: RankDefinition | null;
  loading: boolean;
}

export function useGamificationHud(): UseGamificationHudResult {
  const { user } = useAuth();
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const profRef = doc(
      getFirebaseDb(),
      "users",
      user.uid,
      "gamificationProfile",
      "profile"
    );

    const unsubscribe = onSnapshot(
      profRef,
      (snap) => {
        if (snap.exists()) {
          setProfile(snap.data() as GamificationProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Gamification HUD subscription error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return {
    totalXp: profile?.totalXp ?? 0,
    rank: profile?.rank ?? "Beginner",
    streakDays: profile?.streakDays ?? 0,
    nextRank: profile ? getNextRank(profile.totalXp) : null,
    loading,
  };
}
