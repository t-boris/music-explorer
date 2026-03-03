"use client";

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { LessonNote } from "@/types/index";

function notesCollection(userId: string) {
  return collection(getFirebaseDb(), "users", userId, "lessonNotes");
}

function noteDocRef(userId: string, noteId: string) {
  return doc(getFirebaseDb(), "users", userId, "lessonNotes", noteId);
}

export interface CreateNoteData {
  lessonId: string;
  levelId: string;
  selectedText: string;
  noteText: string;
}

export async function createNote(
  userId: string,
  data: CreateNoteData
): Promise<string> {
  const col = notesCollection(userId);
  const docRef = await addDoc(col, {
    lessonId: data.lessonId,
    levelId: data.levelId,
    selectedText: data.selectedText,
    noteText: data.noteText,
    aiExpansion: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateNoteText(
  userId: string,
  noteId: string,
  noteText: string
): Promise<void> {
  const ref = noteDocRef(userId, noteId);
  await updateDoc(ref, {
    noteText,
    updatedAt: serverTimestamp(),
  });
}

export async function cacheAiExpansion(
  userId: string,
  noteId: string,
  aiExpansion: string
): Promise<void> {
  const ref = noteDocRef(userId, noteId);
  await updateDoc(ref, {
    aiExpansion,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNote(
  userId: string,
  noteId: string
): Promise<void> {
  const ref = noteDocRef(userId, noteId);
  await deleteDoc(ref);
}

export async function getNotesForLesson(
  userId: string,
  lessonId: string,
  levelId: string
): Promise<LessonNote[]> {
  const col = notesCollection(userId);
  const q = query(
    col,
    where("lessonId", "==", lessonId),
    where("levelId", "==", levelId),
    orderBy("createdAt", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as LessonNote);
}
