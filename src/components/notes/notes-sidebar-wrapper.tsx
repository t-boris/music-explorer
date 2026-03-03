"use client";

import { NotesSidebar } from "./notes-sidebar";
import { useNotes } from "./notes-provider";

export function NotesSidebarWrapper() {
  const {
    notes,
    loading,
    isAuthenticated,
    pendingNote,
    clearPending,
    addNote,
    editNote,
    removeNote,
    saveAiExpansion,
    lessonTitle,
    levelTitle,
    levelOrder,
  } = useNotes();

  if (!isAuthenticated) return null;

  return (
    <aside className="hidden lg:block lg:w-80">
      <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-hidden rounded-xl border border-surface-700 bg-surface-900">
        <NotesSidebar
          notes={notes}
          loading={loading}
          pendingNote={pendingNote}
          lessonTitle={lessonTitle}
          levelTitle={levelTitle}
          levelOrder={levelOrder}
          onAddNote={addNote}
          onEditNote={editNote}
          onDeleteNote={removeNote}
          onSaveAiExpansion={saveAiExpansion}
          onCancelPending={clearPending}
        />
      </div>
    </aside>
  );
}
