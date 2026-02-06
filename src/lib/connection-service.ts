"use client";

import {
  collection,
  collectionGroup,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { Connection, InviteLink } from "@/types/index";

// ─── Collection Helpers ───

function connectionsCollection() {
  return collection(getFirebaseDb(), "connections");
}

function inviteLinksCollection(userId: string) {
  return collection(getFirebaseDb(), "users", userId, "inviteLinks");
}

// ─── Invite Link Management ───

export async function createInviteLink(
  userId: string,
  displayName: string
): Promise<string> {
  const code = crypto.randomUUID().slice(0, 8);
  await addDoc(inviteLinksCollection(userId), {
    userId,
    code,
    active: true,
    createdAt: serverTimestamp(),
  });
  return code;
}

export async function getActiveInviteLink(
  userId: string
): Promise<InviteLink | null> {
  const q = query(
    inviteLinksCollection(userId),
    where("active", "==", true),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() } as InviteLink;
}

// ─── Accept Invite ───

export async function acceptInvite(
  code: string,
  currentUserId: string,
  currentDisplayName: string,
  currentPhotoURL: string | null
): Promise<void> {
  // 1. Collection group query to find the invite link across all users
  const inviteQuery = query(
    collectionGroup(getFirebaseDb(), "inviteLinks"),
    where("code", "==", code),
    where("active", "==", true)
  );
  const inviteSnap = await getDocs(inviteQuery);

  if (inviteSnap.empty) {
    throw new Error("Invalid or expired invite code");
  }

  const inviteDoc = inviteSnap.docs[0];

  // 2. Extract sharer's userId from the parent doc path
  //    Path: users/{sharerId}/inviteLinks/{linkId}
  const pathSegments = inviteDoc.ref.path.split("/");
  const sharerId = pathSegments[1];

  // 3. Don't connect with yourself
  if (sharerId === currentUserId) {
    return;
  }

  // 4. Check if already connected
  const existingQuery = query(
    connectionsCollection(),
    where("fromUserId", "==", sharerId),
    where("toUserId", "==", currentUserId)
  );
  const existingSnap = await getDocs(existingQuery);
  if (!existingSnap.empty) {
    return; // Already connected
  }

  // 5. Read sharer's user doc for display info
  const sharerDoc = await getDoc(
    doc(getFirebaseDb(), "users", sharerId)
  );
  const sharerData = sharerDoc.data();
  const sharerDisplayName = sharerData?.displayName ?? "User";
  const sharerPhotoURL = sharerData?.photoURL ?? null;

  // 6. Create connection document
  await addDoc(connectionsCollection(), {
    fromUserId: sharerId,
    toUserId: currentUserId,
    fromDisplayName: sharerDisplayName,
    toDisplayName: currentDisplayName,
    fromPhotoURL: sharerPhotoURL,
    toPhotoURL: currentPhotoURL,
    inviteCode: code,
    createdAt: serverTimestamp(),
  });
}

// ─── Query Connections ───

export async function getMyConnections(
  userId: string
): Promise<Connection[]> {
  const q = query(
    connectionsCollection(),
    where("toUserId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Connection[];
}

export async function getConnectionsToMe(
  userId: string
): Promise<Connection[]> {
  const q = query(
    connectionsCollection(),
    where("fromUserId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Connection[];
}

// ─── Remove Connection ───

export async function removeConnection(
  connectionId: string
): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), "connections", connectionId));
}
