"use client";

import { useCallback, useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import {
  createNote,
  updateNoteText,
  cacheAiExpansion,
  deleteNote,
  type CreateNoteData,
} from "@/lib/notes-service";
import type { LessonNote } from "@/types/index";

interface UseLessonNotesResult {
  notes: LessonNote[];
  loading: boolean;
  addNote: (data: Omit<CreateNoteData, "lessonId" | "levelId">) => Promise<string | null>;
  editNote: (noteId: string, noteText: string) => Promise<void>;
  removeNote: (noteId: string) => Promise<void>;
  saveAiExpansion: (noteId: string, aiExpansion: string) => Promise<void>;
}

export function useLessonNotes(
  levelId: string,
  lessonId: string
): UseLessonNotesResult {
  const { user } = useAuth();
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    const col = collection(
      getFirebaseDb(),
      "users",
      user.uid,
      "lessonNotes"
    );
    const q = query(
      col,
      where("lessonId", "==", lessonId),
      where("levelId", "==", levelId),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const result = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as LessonNote
        );
        setNotes(result);
        setLoading(false);
      },
      (err) => {
        console.error("Lesson notes snapshot error:", err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user, levelId, lessonId]);

  const addNote = useCallback(
    async (data: Omit<CreateNoteData, "lessonId" | "levelId">) => {
      if (!user) return null;
      return createNote(user.uid, { ...data, lessonId, levelId });
    },
    [user, lessonId, levelId]
  );

  const editNote = useCallback(
    async (noteId: string, noteText: string) => {
      if (!user) return;
      await updateNoteText(user.uid, noteId, noteText);
    },
    [user]
  );

  const removeNote = useCallback(
    async (noteId: string) => {
      if (!user) return;
      await deleteNote(user.uid, noteId);
    },
    [user]
  );

  const saveAiExpansion = useCallback(
    async (noteId: string, aiExpansion: string) => {
      if (!user) return;
      await cacheAiExpansion(user.uid, noteId, aiExpansion);
    },
    [user]
  );

  return { notes, loading, addNote, editNote, removeNote, saveAiExpansion };
}
