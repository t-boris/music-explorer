"use client";

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { Comment } from "@/types/index";

// ─── Collection Reference ───

function commentsCollection() {
  return collection(getFirebaseDb(), "comments");
}

function commentDoc(commentId: string) {
  return doc(getFirebaseDb(), "comments", commentId);
}

// ─── Create ───

export interface AddCommentData {
  authorId: string;
  authorDisplayName: string;
  authorPhotoURL: string | null;
  targetUserId: string;
  targetType: Comment["targetType"];
  targetId: string;
  text: string;
}

export async function addComment(data: AddCommentData): Promise<string> {
  const docRef = await addDoc(commentsCollection(), {
    authorId: data.authorId,
    authorDisplayName: data.authorDisplayName,
    authorPhotoURL: data.authorPhotoURL,
    targetUserId: data.targetUserId,
    targetType: data.targetType,
    targetId: data.targetId,
    text: data.text,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// ─── Read (comments for a specific item) ───

export async function getCommentsForItem(
  targetUserId: string,
  targetType: Comment["targetType"],
  targetId: string
): Promise<Comment[]> {
  const q = query(
    commentsCollection(),
    where("targetUserId", "==", targetUserId),
    where("targetType", "==", targetType),
    where("targetId", "==", targetId),
    orderBy("createdAt", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Comment[];
}

// ─── Read (all comments for a user's items) ───

export async function getCommentsForUser(
  targetUserId: string,
  limitCount = 50
): Promise<Comment[]> {
  const q = query(
    commentsCollection(),
    where("targetUserId", "==", targetUserId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Comment[];
}

// ─── Delete ───

export async function deleteComment(
  commentId: string,
  authorId: string
): Promise<void> {
  // Client-side guard — Firestore rules enforce server-side
  void authorId;
  await deleteDoc(commentDoc(commentId));
}
