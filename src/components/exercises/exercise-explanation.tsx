"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, RotateCcw } from "lucide-react";
import { motion } from "motion/react";

// ─── Response Cache ───

const responseCache = new Map<string, string>();

function getCacheKey(exerciseTitle: string, question: string, studentAnswer: string): string {
  const raw = `${exerciseTitle}|${question}|${studentAnswer}`;
  return raw.slice(0, 300).toLowerCase().trim();
}

// ─── Simple Markdown Renderer (duplicated from dig-deeper-popover to avoid coupling) ───

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
          <code
            key={`${i}-c-${match.index}`}
            className="rounded bg-surface-700 px-1 py-0.5 font-mono text-xs text-accent-400"
          >
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

// ─── Props ───

interface ExerciseExplanationProps {
  exerciseTitle: string;
  exerciseType: string;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
  onClose: () => void;
}

// ─── Component ───

export function ExerciseExplanation({
  exerciseTitle,
  exerciseType,
  question,
  studentAnswer,
  correctAnswer,
  isCorrect,
  lessonTitle,
  levelTitle,
  levelOrder,
  onClose,
}: ExerciseExplanationProps) {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"loading" | "streaming" | "complete" | "error">("loading");
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchExplanation = useCallback(async () => {
    const cacheKey = getCacheKey(exerciseTitle, question, studentAnswer);
    const cached = responseCache.get(cacheKey);

    if (cached) {
      setContent(cached);
      setStatus("complete");
      return;
    }

    setContent("");
    setStatus("loading");

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Construct a descriptive selectedText to send to the existing /api/dig-deeper endpoint
      const selectedText = `Exercise: ${exerciseTitle} (${exerciseType}). Question: ${question}. Student answered: ${studentAnswer}. Correct answer: ${correctAnswer}. Was correct: ${isCorrect}.`;

      const response = await fetch("/api/dig-deeper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedText,
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

      responseCache.set(cacheKey, accumulated);
      setStatus("complete");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setStatus("error");
    }
  }, [exerciseTitle, exerciseType, question, studentAnswer, correctAnswer, isCorrect, lessonTitle, levelTitle, levelOrder]);

  useEffect(() => {
    fetchExplanation();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchExplanation]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`mt-3 overflow-hidden rounded-lg border-l-4 bg-surface-700/50 ${
        isCorrect ? "border-l-green-500" : "border-l-amber-500"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-medium text-text-muted">
          {isCorrect ? "Why this is correct" : "Understanding the answer"}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text-muted transition-colors hover:bg-surface-600 hover:text-text-secondary"
          aria-label="Close explanation"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Body */}
      <div className="max-h-[200px] overflow-y-auto px-3 pb-3">
        {status === "loading" && (
          <div className="flex items-center gap-2 py-2">
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-400" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-400" style={{ animationDelay: "200ms" }} />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-400" style={{ animationDelay: "400ms" }} />
            </div>
            <span className="text-xs text-text-muted">Thinking...</span>
          </div>
        )}

        {(status === "streaming" || status === "complete") && (
          <div>{renderSimpleMarkdown(content)}</div>
        )}

        {status === "error" && (
          <div className="py-2 text-center">
            <p className="mb-2 text-xs text-text-secondary">
              Could not load explanation.
            </p>
            <button
              type="button"
              onClick={fetchExplanation}
              className="inline-flex items-center gap-1.5 rounded-lg bg-surface-600 px-2.5 py-1 text-xs text-text-secondary transition-colors hover:bg-surface-500"
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
