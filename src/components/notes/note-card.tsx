"use client";

import { useState, useCallback } from "react";
import { Quote, Sparkles, Trash2, Pencil, Check, X, RotateCcw } from "lucide-react";
import type { LessonNote } from "@/types/index";

function renderSimpleMarkdown(text: string): React.ReactNode[] {
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((para, i) => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*|`([^`]+)`)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(para)) !== null) {
      if (match.index > lastIndex) {
        parts.push(para.slice(lastIndex, match.index));
      }
      if (match[2]) {
        parts.push(
          <strong key={`${i}-b-${match.index}`} className="font-semibold text-text-primary">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        parts.push(
          <code key={`${i}-c-${match.index}`} className="rounded bg-surface-700 px-1 py-0.5 font-mono text-xs text-accent-400">
            {match[3]}
          </code>
        );
      }
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < para.length) {
      parts.push(para.slice(lastIndex));
    }

    return (
      <p key={i} className="mb-2 text-xs leading-relaxed text-text-secondary last:mb-0">
        {parts.length > 0 ? parts : para}
      </p>
    );
  });
}

interface NoteCardProps {
  note: LessonNote;
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
  onEdit: (noteId: string, noteText: string) => Promise<void>;
  onDelete: (noteId: string) => Promise<void>;
  onSaveAiExpansion: (noteId: string, aiExpansion: string) => Promise<void>;
}

export function NoteCard({
  note,
  lessonTitle,
  levelTitle,
  levelOrder,
  onEdit,
  onDelete,
  onSaveAiExpansion,
}: NoteCardProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(note.noteText);
  const [aiContent, setAiContent] = useState(note.aiExpansion ?? "");
  const [aiStatus, setAiStatus] = useState<"idle" | "loading" | "streaming" | "complete" | "error">(
    note.aiExpansion ? "complete" : "idle"
  );
  const [deleting, setDeleting] = useState(false);

  const handleSaveEdit = async () => {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === note.noteText) {
      setEditing(false);
      return;
    }
    await onEdit(note.id, trimmed);
    setEditing(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(note.id);
  };

  const handleAiExpand = useCallback(async () => {
    if (note.aiExpansion) {
      setAiContent(note.aiExpansion);
      setAiStatus("complete");
      return;
    }

    setAiContent("");
    setAiStatus("loading");

    try {
      const response = await fetch("/api/dig-deeper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedText: note.selectedText,
          lessonTitle,
          levelTitle,
          levelOrder,
        }),
      });

      if (!response.ok || !response.body) {
        setAiStatus("error");
        return;
      }

      setAiStatus("streaming");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setAiContent(accumulated);
      }

      setAiStatus("complete");
      await onSaveAiExpansion(note.id, accumulated);
    } catch {
      setAiStatus("error");
    }
  }, [note, lessonTitle, levelTitle, levelOrder, onSaveAiExpansion]);

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-3">
      {/* Selected text quote */}
      <div className="mb-2 flex gap-2">
        <Quote className="mt-0.5 h-3 w-3 shrink-0 text-accent-400/60" />
        <p className="line-clamp-2 text-xs italic leading-relaxed text-text-muted">
          {note.selectedText}
        </p>
      </div>

      {/* Note text */}
      {editing ? (
        <div className="mb-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-surface-600 bg-surface-900 px-2.5 py-1.5 text-xs text-text-primary focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
          />
          <div className="mt-1.5 flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => { setEditing(false); setEditText(note.noteText); }}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-text-muted hover:text-text-secondary"
            >
              <X className="h-3 w-3" /> Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="flex items-center gap-1 rounded bg-accent-500 px-2 py-1 text-xs font-medium text-surface-900 hover:bg-accent-600"
            >
              <Check className="h-3 w-3" /> Save
            </button>
          </div>
        </div>
      ) : (
        <p className="mb-2 text-sm leading-relaxed text-text-primary">
          {note.noteText}
        </p>
      )}

      {/* AI Expansion */}
      {aiStatus === "loading" && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-surface-900 px-3 py-2">
          <div className="flex gap-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-400" style={{ animationDelay: "0ms" }} />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-400" style={{ animationDelay: "200ms" }} />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-400" style={{ animationDelay: "400ms" }} />
          </div>
          <span className="text-xs text-text-muted">Expanding...</span>
        </div>
      )}

      {(aiStatus === "streaming" || aiStatus === "complete") && aiContent && (
        <div className="mb-2 rounded-lg bg-surface-900 px-3 py-2">
          <div className="mb-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-accent-400" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-accent-400">
              AI Insight
            </span>
          </div>
          <div>{renderSimpleMarkdown(aiContent)}</div>
        </div>
      )}

      {aiStatus === "error" && (
        <div className="mb-2 rounded-lg bg-surface-900 px-3 py-2 text-center">
          <p className="mb-1.5 text-xs text-text-muted">Could not expand. Try again.</p>
          <button
            type="button"
            onClick={handleAiExpand}
            className="inline-flex items-center gap-1 text-xs text-accent-400 hover:text-accent-300"
          >
            <RotateCcw className="h-3 w-3" /> Retry
          </button>
        </div>
      )}

      {/* Action buttons */}
      {!editing && (
        <div className="flex items-center gap-1">
          {aiStatus === "idle" && (
            <button
              type="button"
              onClick={handleAiExpand}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-accent-400 transition-colors hover:bg-surface-700"
            >
              <Sparkles className="h-3 w-3" /> AI Expand
            </button>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex h-6 w-6 items-center justify-center rounded text-text-muted transition-colors hover:bg-surface-700 hover:text-text-secondary"
            aria-label="Edit note"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex h-6 w-6 items-center justify-center rounded text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
            aria-label="Delete note"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
