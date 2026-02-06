"use client";

import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { ActivityEvent } from "@/types/index";

// ─── Collection Helper ───

function activityCollection(userId: string) {
  return collection(getFirebaseDb(), "users", userId, "activityEvents");
}

// ─── Log Activity ───

export interface LogActivityData {
  type: ActivityEvent["type"];
  title: string;
  metadata: Record<string, string>;
  userDisplayName: string;
  userPhotoURL: string | null;
}

export async function logActivity(
  userId: string,
  data: LogActivityData
): Promise<string> {
  const docRef = await addDoc(activityCollection(userId), {
    userId,
    userDisplayName: data.userDisplayName,
    userPhotoURL: data.userPhotoURL,
    type: data.type,
    title: data.title,
    metadata: data.metadata,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// ─── Query Activity for a Single User ───

export async function getActivityForUser(
  userId: string,
  limitCount: number = 20
): Promise<ActivityEvent[]> {
  const q = query(
    activityCollection(userId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as ActivityEvent[];
}

// ─── Activity Feed (merge from multiple users) ───

export async function getActivityFeed(
  userIds: string[],
  limitCount: number = 20
): Promise<ActivityEvent[]> {
  if (userIds.length === 0) return [];

  // Fetch activity from each user in parallel
  const allActivities = await Promise.all(
    userIds.map((uid) => getActivityForUser(uid, limitCount))
  );

  // Flatten, sort by createdAt desc, take top limitCount
  const merged = allActivities
    .flat()
    .sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() ?? 0;
      const bTime = b.createdAt?.toMillis?.() ?? 0;
      return bTime - aTime;
    })
    .slice(0, limitCount);

  return merged;
}
