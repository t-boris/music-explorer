"use client";

import { useEffect, useState, useCallback } from "react";
import { onSnapshot } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import {
  getBadges,
  getDailyMissions,
  awardDailyMissionBonus,
} from "@/lib/gamification-service";
import { getNextRank } from "@/lib/gamification-config";
import type {
  GamificationProfile,
  Badge,
  DailyMission,
} from "@/types/index";
import type { RankDefinition } from "@/lib/gamification-config";

interface UseGamificationResult {
  profile: GamificationProfile | null;
  badges: Badge[];
  missions: DailyMission[];
  allMissionsComplete: boolean;
  nextRank: RankDefinition | null;
  xpToNextRank: number;
  loading: boolean;
  error: string | null;
  claimDailyBonus: () => Promise<number>;
}

export function useGamification(): UseGamificationResult {
  const { user } = useAuth();
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time profile subscription
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setBadges([]);
      setMissions([]);
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
      async (snap) => {
        if (snap.exists()) {
          const p = snap.data() as GamificationProfile;
          setProfile(p);
          setMissions(getDailyMissions(p));

          // Fetch badges when profile updates
          try {
            const b = await getBadges(user.uid);
            setBadges(b);
          } catch (err) {
            console.error("Failed to fetch badges:", err);
          }
        } else {
          setProfile(null);
          setMissions([]);
          setBadges([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Gamification profile subscription error:", err);
        setError("Failed to load gamification data");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const nextRank = profile ? getNextRank(profile.totalXp) : null;
  const xpToNextRank = nextRank ? nextRank.minXp - (profile?.totalXp ?? 0) : 0;
  const allMissionsComplete =
    missions.length > 0 && missions.every((m) => m.completed);

  const claimDailyBonus = useCallback(async () => {
    if (!user) return 0;
    return awardDailyMissionBonus(user.uid);
  }, [user]);

  return {
    profile,
    badges,
    missions,
    allMissionsComplete,
    nextRank,
    xpToNextRank,
    loading,
    error,
    claimDailyBonus,
  };
}
