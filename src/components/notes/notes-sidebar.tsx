"use client";

import { StickyNote } from "lucide-react";
import { NoteCard } from "./note-card";
import { NoteEditor } from "./note-editor";
import type { LessonNote } from "@/types/index";
import type { PendingNote } from "./notes-provider";

interface NotesSidebarProps {
  notes: LessonNote[];
  loading: boolean;
  pendingNote: PendingNote | null;
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
  onAddNote: (data: { selectedText: string; noteText: string }) => Promise<string | null>;
  onEditNote: (noteId: string, noteText: string) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
  onSaveAiExpansion: (noteId: string, aiExpansion: string) => Promise<void>;
  onCancelPending: () => void;
}

export function NotesSidebar({
  notes,
  loading,
  pendingNote,
  lessonTitle,
  levelTitle,
  levelOrder,
  onAddNote,
  onEditNote,
  onDeleteNote,
  onSaveAiExpansion,
  onCancelPending,
}: NotesSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-surface-700 px-4 py-3">
        <StickyNote className="h-4 w-4 text-accent-400" />
        <h3 className="text-sm font-semibold text-text-primary">
          My Notes
        </h3>
        {notes.length > 0 && (
          <span className="rounded-full bg-accent-500/15 px-1.5 py-0.5 text-[10px] font-medium text-accent-400">
            {notes.length}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {/* Pending note editor */}
        {pendingNote && (
          <div className="mb-3">
            <NoteEditor
              selectedText={pendingNote.selectedText}
              onSave={async (noteText) => {
                await onAddNote({
                  selectedText: pendingNote.selectedText,
                  noteText,
                });
              }}
              onCancel={onCancelPending}
            />
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col gap-3 py-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl bg-surface-700"
              />
            ))}
          </div>
        )}

        {/* Notes list */}
        {!loading && notes.length > 0 && (
          <div className="space-y-3">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                lessonTitle={lessonTitle}
                levelTitle={levelTitle}
                levelOrder={levelOrder}
                onEdit={onEditNote}
                onDelete={onDeleteNote}
                onSaveAiExpansion={onSaveAiExpansion}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && notes.length === 0 && !pendingNote && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <StickyNote className="mb-3 h-8 w-8 text-surface-600" />
            <p className="text-sm text-text-muted">No notes yet</p>
            <p className="mt-1 text-xs text-text-muted">
              Select text in the lesson and click &ldquo;Add Note&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
