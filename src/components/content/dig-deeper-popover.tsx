"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, RotateCcw, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ─── Response Cache ───

const responseCache = new Map<string, string>();

function getCacheKey(term?: string, selectedText?: string): string {
  const raw = term || selectedText || "";
  // Simple hash: use the first 200 chars to keep keys manageable
  return raw.slice(0, 200).toLowerCase().trim();
}

// ─── Simple Markdown Renderer ───

function renderSimpleMarkdown(text: string): React.ReactNode[] {
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((para, i) => {
    // Replace **bold** with <strong>
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*|`([^`]+)`)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(para)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(para.slice(lastIndex, match.index));
      }

      if (match[2]) {
        // Bold
        parts.push(<strong key={`${i}-b-${match.index}`} className="font-semibold text-text-primary">{match[2]}</strong>);
      } else if (match[3]) {
        // Code
        parts.push(
          <code key={`${i}-c-${match.index}`} className="rounded bg-surface-700 px-1 py-0.5 font-mono text-xs text-accent-400">
            {match[3]}
          </code>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < para.length) {
      parts.push(para.slice(lastIndex));
    }

    return (
      <p key={i} className="mb-3 text-sm leading-relaxed text-text-secondary last:mb-0">
        {parts.length > 0 ? parts : para}
      </p>
    );
  });
}

// ─── Props ───

interface DigDeeperPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  term?: string;
  selectedText?: string;
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
  anchorRect?: DOMRect | null;
}

// ─── Component ───

export function DigDeeperPopover({
  isOpen,
  onClose,
  term,
  selectedText,
  lessonTitle,
  levelTitle,
  levelOrder,
  anchorRect,
}: DigDeeperPopoverProps) {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"loading" | "streaming" | "complete" | "error">("loading");
  const popoverRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchExplanation = useCallback(async () => {
    const cacheKey = getCacheKey(term, selectedText);
    const cached = responseCache.get(cacheKey);

    if (cached) {
      setContent(cached);
      setStatus("complete");
      return;
    }

    setContent("");
    setStatus("loading");

    // Abort any previous in-flight request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/dig-deeper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(term ? { term } : { selectedText }),
          lessonTitle,
          levelTitle,
          levelOrder,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      if (!response.body) {
        setStatus("error");
        return;
      }

      setStatus("streaming");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setContent(accumulated);
      }

      // Cache the completed response
      responseCache.set(cacheKey, accumulated);
      setStatus("complete");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setStatus("error");
    }
  }, [term, selectedText, lessonTitle, levelTitle, levelOrder]);

  // Fetch when opened
  useEffect(() => {
    if (isOpen) {
      fetchExplanation();
    }

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [isOpen, fetchExplanation]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Delay adding the listener to avoid closing immediately on the trigger click
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // ─── Positioning ───

  const getPosition = (): React.CSSProperties => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

    if (isMobile) {
      return {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: "60vh",
      };
    }

    if (!anchorRect) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - anchorRect.bottom;
    const popoverMaxHeight = 400;

    // Position below by default, above if not enough space
    if (spaceBelow > popoverMaxHeight + 16) {
      return {
        position: "fixed",
        top: anchorRect.bottom + 8,
        left: Math.max(8, Math.min(anchorRect.left, window.innerWidth - 488)),
      };
    }

    return {
      position: "fixed",
      bottom: viewportHeight - anchorRect.top + 8,
      left: Math.max(8, Math.min(anchorRect.left, window.innerWidth - 488)),
    };
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const displayLabel = term || "Selected text";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50"
              onClick={onClose}
            />
          )}

          <motion.div
            ref={popoverRef}
            initial={isMobile ? { y: "100%" } : { opacity: 0, y: 8 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, y: 0 }}
            exit={isMobile ? { y: "100%" } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={getPosition()}
            className={`z-50 flex flex-col overflow-hidden border border-surface-600 bg-surface-800 shadow-2xl ${
              isMobile
                ? "rounded-t-xl"
                : "max-h-[400px] w-[480px] max-w-[calc(100vw-16px)] rounded-xl"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-surface-700 px-4 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="h-4 w-4 shrink-0 text-accent-400" />
                <span className="truncate text-sm font-semibold text-text-primary">
                  {displayLabel}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-700 hover:text-text-secondary"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {status === "loading" && (
                <div className="flex items-center gap-2 py-4">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-accent-400" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-accent-400" style={{ animationDelay: "200ms" }} />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-accent-400" style={{ animationDelay: "400ms" }} />
                  </div>
                  <span className="text-sm text-text-muted">Thinking...</span>
                </div>
              )}

              {(status === "streaming" || status === "complete") && (
                <div>{renderSimpleMarkdown(content)}</div>
              )}

              {status === "error" && (
                <div className="py-4 text-center">
                  <p className="mb-3 text-sm text-text-secondary">
                    Could not load explanation. Please try again.
                  </p>
                  <button
                    type="button"
                    onClick={fetchExplanation}
                    className="inline-flex items-center gap-2 rounded-lg bg-surface-700 px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-600"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Retry
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-surface-700 px-4 py-2">
              <p className="text-xs text-text-muted">Powered by AI</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
