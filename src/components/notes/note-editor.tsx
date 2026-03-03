"use client";

import { useState, useRef, useEffect } from "react";
import { Quote, X } from "lucide-react";

interface NoteEditorProps {
  selectedText: string;
  onSave: (noteText: string) => Promise<void>;
  onCancel: () => void;
}

export function NoteEditor({ selectedText, onSave, onCancel }: NoteEditorProps) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSave = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await onSave(trimmed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-accent-500/30 bg-surface-800 p-3">
      {/* Selected text quote */}
      <div className="mb-3 flex gap-2">
        <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-400" />
        <p className="line-clamp-3 text-xs italic leading-relaxed text-text-muted">
          {selectedText}
        </p>
      </div>

      {/* Note textarea */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your note..."
        rows={3}
        className="w-full resize-none rounded-lg border border-surface-600 bg-surface-900 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
      />

      {/* Actions */}
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-surface-700"
        >
          <X className="h-3 w-3" />
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !text.trim()}
          className="rounded-lg bg-accent-500 px-3 py-1.5 text-xs font-medium text-surface-900 transition-colors hover:bg-accent-600 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Note"}
        </button>
      </div>
    </div>
  );
}
