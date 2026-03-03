"use client";

import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  orderBy,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import {
  XP_TABLE,
  DAILY_CAPS,
  DAILY_MISSION_BONUS_XP,
  BADGE_DEFINITIONS,
  getRankForXp,
  emptyDailyCounts,
  emptyTotalCounts,
} from "@/lib/gamification-config";
import type {
  GamificationEventType,
  GamificationProfile,
  Badge,
  DailyMission,
  DailyCounts,
} from "@/types/index";

// ─── Helpers ───

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

function profileDocRef(userId: string) {
  return doc(getFirebaseDb(), "users", userId, "gamificationProfile", "profile");
}

function eventDocRef(userId: string, dedupeKey: string) {
  return doc(getFirebaseDb(), "users", userId, "gamificationEvents", dedupeKey);
}

function badgesCollection(userId: string) {
  return collection(getFirebaseDb(), "users", userId, "badges");
}

// ─── Default Profile ───

function defaultProfile(): Omit<GamificationProfile, "updatedAt"> {
  return {
    totalXp: 0,
    rank: "Beginner",
    streakDays: 0,
    lastActiveDay: "",
    dailyCounts: emptyDailyCounts(getTodayKey()),
    totalCounts: emptyTotalCounts(),
  };
}

// ─── Emit Gamification Event ───

export interface EmitEventData {
  type: GamificationEventType;
  sourceId: string;
  levelId: string;
  lessonId?: string;
}

export async function emitGamificationEvent(
  userId: string,
  data: EmitEventData
): Promise<number> {
  const db = getFirebaseDb();
  const dedupeKey = `${data.type}:${data.sourceId}`;
  const todayKey = getTodayKey();

  const xpAwarded = await runTransaction(db, async (transaction) => {
    // Read event doc to check for duplicate
    const eventRef = eventDocRef(userId, dedupeKey);
    const eventSnap = await transaction.get(eventRef);

    if (eventSnap.exists()) {
      // Already processed — idempotent, 0 XP
      return 0;
    }

    // Read or initialize profile
    const profRef = profileDocRef(userId);
    const profSnap = await transaction.get(profRef);
    const profile = profSnap.exists()
      ? (profSnap.data() as GamificationProfile)
      : { ...defaultProfile(), updatedAt: null };

    // Reset daily counts if new day
    let dailyCounts: DailyCounts =
      profile.dailyCounts?.dayKey === todayKey
        ? { ...profile.dailyCounts }
        : emptyDailyCounts(todayKey);

    // Clone total counts
    const totalCounts = { ...emptyTotalCounts(), ...profile.totalCounts };

    // Apply anti-grind cap
    const cap = DAILY_CAPS[data.type];
    const overCap = dailyCounts[data.type] >= cap;
    const xp = overCap ? 0 : XP_TABLE[data.type];

    // Update counts (event counts always, even when capped)
    dailyCounts[data.type]++;
    totalCounts[data.type]++;

    const newTotalXp = (profile.totalXp ?? 0) + xp;

    // Streak logic
    let streakDays = profile.streakDays ?? 0;
    const lastActiveDay = profile.lastActiveDay ?? "";

    if (lastActiveDay === todayKey) {
      // Same day — no change
    } else if (lastActiveDay) {
      const lastDate = new Date(lastActiveDay + "T00:00:00Z");
      const todayDate = new Date(todayKey + "T00:00:00Z");
      const diffDays = Math.round(
        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        streakDays++;
      } else {
        streakDays = 1;
      }
    } else {
      // First activity ever
      streakDays = 1;
    }

    const newRank = getRankForXp(newTotalXp);

    // Write event doc
    transaction.set(eventRef, {
      type: data.type,
      sourceId: data.sourceId,
      levelId: data.levelId,
      lessonId: data.lessonId ?? "",
      occurredAt: serverTimestamp(),
      dedupeKey,
      meta: {},
    });

    // Write profile doc
    transaction.set(profRef, {
      totalXp: newTotalXp,
      rank: newRank,
      streakDays,
      lastActiveDay: todayKey,
      dailyCounts,
      totalCounts,
      updatedAt: serverTimestamp(),
    });

    return xp;
  });

  // Best-effort badge check outside transaction
  try {
    await checkAndAwardBadges(userId);
  } catch (err) {
    console.error("Failed to check badges:", err);
  }

  return xpAwarded;
}

// ─── Badge Checking ───

async function checkAndAwardBadges(userId: string): Promise<void> {
  const profile = await getGamificationProfile(userId);
  if (!profile) return;

  const existingBadges = await getBadges(userId);
  const existingIds = new Set(existingBadges.map((b) => b.id));

  for (const def of BADGE_DEFINITIONS) {
    if (existingIds.has(def.id)) continue;

    const earned = def.condition(
      profile.totalCounts,
      profile.streakDays,
      profile.totalXp
    );

    if (earned) {
      const badgeRef = doc(getFirebaseDb(), "users", userId, "badges", def.id);
      await setDoc(badgeRef, {
        id: def.id,
        title: def.title,
        description: def.description,
        icon: def.icon,
        unlockedAt: serverTimestamp(),
      });
    }
  }
}

// ─── Read Profile ───

export async function getGamificationProfile(
  userId: string
): Promise<GamificationProfile | null> {
  const snap = await getDoc(profileDocRef(userId));
  if (!snap.exists()) return null;
  return snap.data() as GamificationProfile;
}

// ─── Read Badges ───

export async function getBadges(userId: string): Promise<Badge[]> {
  const q = query(badgesCollection(userId), orderBy("unlockedAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data() as Badge);
}

// ─── Daily Missions ───

export function getDailyMissions(profile: GamificationProfile): DailyMission[] {
  const daily = profile.dailyCounts;

  return [
    {
      id: "mission_exercises",
      title: "Practice 3 exercises",
      description: "Complete any 3 exercises today",
      target: 3,
      current: Math.min(daily.exercise_completed, 3),
      completed: daily.exercise_completed >= 3,
    },
    {
      id: "mission_recording",
      title: "Record yourself",
      description: "Create at least 1 recording today",
      target: 1,
      current: Math.min(daily.recording_created, 1),
      completed: daily.recording_created >= 1,
    },
    {
      id: "mission_session",
      title: "Log a practice session",
      description: "Log at least 1 practice session today",
      target: 1,
      current: Math.min(daily.session_logged, 1),
      completed: daily.session_logged >= 1,
    },
  ];
}

// ─── Daily Mission Bonus ───

export async function awardDailyMissionBonus(userId: string): Promise<number> {
  const db = getFirebaseDb();
  const todayKey = getTodayKey();
  const dedupeKey = `daily_mission_bonus:${todayKey}`;

  return runTransaction(db, async (transaction) => {
    const eventRef = eventDocRef(userId, dedupeKey);
    const eventSnap = await transaction.get(eventRef);

    if (eventSnap.exists()) return 0;

    const profRef = profileDocRef(userId);
    const profSnap = await transaction.get(profRef);
    if (!profSnap.exists()) return 0;

    const profile = profSnap.data() as GamificationProfile;
    const newXp = profile.totalXp + DAILY_MISSION_BONUS_XP;
    const newRank = getRankForXp(newXp);

    transaction.set(eventRef, {
      type: "daily_mission_bonus",
      sourceId: todayKey,
      levelId: "",
      lessonId: "",
      occurredAt: serverTimestamp(),
      dedupeKey,
      meta: {},
    });

    transaction.update(profRef, {
      totalXp: newXp,
      rank: newRank,
      updatedAt: serverTimestamp(),
    });

    return DAILY_MISSION_BONUS_XP;
  });
}
