"use client";

import { StickyNote } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NotesSidebar } from "./notes-sidebar";
import { useNotes } from "./notes-provider";

export function MobileNotesToggle() {
  const {
    notes,
    loading,
    isAuthenticated,
    sidebarOpen,
    pendingNote,
    setSidebarOpen,
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
    <>
      {/* Floating action button — mobile only */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent-500 shadow-lg transition-colors hover:bg-accent-600 lg:hidden"
        aria-label="Open notes"
      >
        <StickyNote className="h-5 w-5 text-surface-900" />
        {notes.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {notes.length}
          </span>
        )}
      </button>

      {/* Bottom sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="bottom"
          showCloseButton
          className="h-[70vh] rounded-t-xl bg-surface-800"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>My Notes</SheetTitle>
          </SheetHeader>
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
        </SheetContent>
      </Sheet>
    </>
  );
}
