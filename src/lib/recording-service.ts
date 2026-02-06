"use client";

import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type QueryConstraint,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getFirebaseDb, getFirebaseStorage } from "@/lib/firebase";
import type { Recording } from "@/types/index";

// ─── Collection Path Helpers ───

function recordingsCollection(userId: string) {
  return collection(getFirebaseDb(), "users", userId, "recordings");
}

function recordingDoc(userId: string, recordingId: string) {
  return doc(getFirebaseDb(), "users", userId, "recordings", recordingId);
}

// ─── Upload Recording ───

export interface UploadRecordingMetadata {
  duration: number;
  contextType: Recording["contextType"];
  contextId: string;
  contextTitle: string;
  levelId: string;
  sessionId?: string;
}

export async function uploadRecording(
  userId: string,
  blob: Blob,
  metadata: UploadRecordingMetadata
): Promise<Recording> {
  const id = `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Determine file extension from blob type
  const ext = blob.type.includes("mp4") ? "mp4" : "webm";
  const storagePath = `users/${userId}/recordings/${id}.${ext}`;

  // Upload to Firebase Storage
  const storageRef = ref(getFirebaseStorage(), storagePath);
  await uploadBytes(storageRef, blob, { contentType: blob.type });
  const downloadUrl = await getDownloadURL(storageRef);

  // Create Firestore document
  const recording: Omit<Recording, "createdAt"> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    id,
    userId,
    storageUrl: storagePath,
    downloadUrl,
    duration: metadata.duration,
    createdAt: serverTimestamp(),
    contextType: metadata.contextType,
    contextId: metadata.contextId,
    contextTitle: metadata.contextTitle,
    levelId: metadata.levelId,
    ...(metadata.sessionId ? { sessionId: metadata.sessionId } : {}),
  };

  await setDoc(recordingDoc(userId, id), recording);

  return recording as unknown as Recording;
}

// ─── Get Recordings ───

export async function getRecordings(
  userId: string,
  contextType?: Recording["contextType"],
  contextId?: string
): Promise<Recording[]> {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];

  if (contextType) {
    constraints.unshift(where("contextType", "==", contextType));
  }
  if (contextId) {
    constraints.unshift(where("contextId", "==", contextId));
  }

  const q = query(recordingsCollection(userId), ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Recording[];
}

// ─── Get Recordings by Session ───

export async function getRecordingsBySession(
  userId: string,
  sessionId: string
): Promise<Recording[]> {
  const q = query(
    recordingsCollection(userId),
    where("sessionId", "==", sessionId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Recording[];
}

// ─── Delete Recording ───

export async function deleteRecording(
  userId: string,
  recordingId: string,
  storagePath: string
): Promise<void> {
  // Delete from Storage
  try {
    const storageRef = ref(getFirebaseStorage(), storagePath);
    await deleteObject(storageRef);
  } catch (err) {
    // Storage file may already be deleted; continue to remove Firestore doc
    console.warn("Storage delete failed (may already be removed):", err);
  }

  // Delete Firestore document
  await deleteDoc(recordingDoc(userId, recordingId));
}
