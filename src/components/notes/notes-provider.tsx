"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLessonNotes } from "@/hooks/use-lesson-notes";
import type { LessonNote } from "@/types/index";

export interface PendingNote {
  selectedText: string;
}

interface NotesContextValue {
  notes: LessonNote[];
  loading: boolean;
  isAuthenticated: boolean;
  sidebarOpen: boolean;
  pendingNote: PendingNote | null;
  setSidebarOpen: (open: boolean) => void;
  startNote: (pending: PendingNote) => void;
  clearPending: () => void;
  addNote: (data: { selectedText: string; noteText: string }) => Promise<string | null>;
  editNote: (noteId: string, noteText: string) => Promise<void>;
  removeNote: (noteId: string) => Promise<void>;
  saveAiExpansion: (noteId: string, aiExpansion: string) => Promise<void>;
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
}

const NotesContext = createContext<NotesContextValue | null>(null);

export function useNotes(): NotesContextValue {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used within a NotesProvider");
  return ctx;
}

interface NotesProviderProps {
  levelId: string;
  lessonId: string;
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
  children: ReactNode;
}

export function NotesProvider({
  levelId,
  lessonId,
  lessonTitle,
  levelTitle,
  levelOrder,
  children,
}: NotesProviderProps) {
  const { user } = useAuth();
  const {
    notes,
    loading,
    addNote: addNoteService,
    editNote: editNoteService,
    removeNote: removeNoteService,
    saveAiExpansion: saveAiExpansionService,
  } = useLessonNotes(levelId, lessonId);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingNote, setPendingNote] = useState<PendingNote | null>(null);

  const startNote = useCallback((pending: PendingNote) => {
    setPendingNote(pending);
    setSidebarOpen(true);
  }, []);

  const clearPending = useCallback(() => {
    setPendingNote(null);
  }, []);

  const addNote = useCallback(
    async (data: { selectedText: string; noteText: string }) => {
      const id = await addNoteService(data);
      setPendingNote(null);
      return id;
    },
    [addNoteService]
  );

  return (
    <NotesContext.Provider
      value={{
        notes,
        loading,
        isAuthenticated: !!user,
        sidebarOpen,
        pendingNote,
        setSidebarOpen,
        startNote,
        clearPending,
        addNote,
        editNote: editNoteService,
        removeNote: removeNoteService,
        saveAiExpansion: saveAiExpansionService,
        lessonTitle,
        levelTitle,
        levelOrder,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}
