"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { ExerciseExplanation } from "@/components/exercises/exercise-explanation";

// ─── Types ───

interface BeatCounterProps {
  onComplete: () => void;
  completed: boolean;
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
}

interface NoteItem {
  symbol: string;
  label: string;
  beats: number;
  type: "note" | "rest" | "dotted";
}

// ─── Note palette ───

const NOTES: NoteItem[] = [
  { symbol: "𝅝", label: "whole", beats: 4, type: "note" },
  { symbol: "𝅗𝅥", label: "half", beats: 2, type: "note" },
  { symbol: "♩", label: "quarter", beats: 1, type: "note" },
  { symbol: "♪", label: "eighth", beats: 0.5, type: "note" },
];

const DOTTED: NoteItem[] = [
  { symbol: "𝅗𝅥.", label: "dotted half", beats: 3, type: "dotted" },
  { symbol: "♩.", label: "dotted quarter", beats: 1.5, type: "dotted" },
  { symbol: "♪.", label: "dotted eighth", beats: 0.75, type: "dotted" },
];

const RESTS: NoteItem[] = [
  { symbol: "𝄼", label: "half rest", beats: 2, type: "rest" },
  { symbol: "𝄽", label: "quarter rest", beats: 1, type: "rest" },
  { symbol: "𝄾", label: "eighth rest", beats: 0.5, type: "rest" },
];

const ALL_ITEMS = [...NOTES, ...DOTTED, ...RESTS];

// ─── Sequence generator ───

function generateSequence(): NoteItem[] {
  const targetLength = 4 + Math.floor(Math.random() * 3); // 4–6 items
  const seq: NoteItem[] = [];

  for (let i = 0; i < targetLength; i++) {
    // Bias toward regular notes, with occasional dotted/rests
    const roll = Math.random();
    let pool: NoteItem[];
    if (roll < 0.5) {
      pool = NOTES;
    } else if (roll < 0.75) {
      pool = DOTTED;
    } else {
      pool = RESTS;
    }
    seq.push(pool[Math.floor(Math.random() * pool.length)]);
  }

  return seq;
}

function totalBeats(seq: NoteItem[]): number {
  return seq.reduce((sum, n) => sum + n.beats, 0);
}

function formatBeats(beats: number): string {
  if (Number.isInteger(beats)) return beats.toString();
  // Show as fraction-friendly decimal
  return beats.toString();
}

// ─── SVG Note rendering ───

const NOTE_WIDTH = 48;
const NOTE_HEIGHT = 60;

function NoteSymbol({ item, x }: { item: NoteItem; x: number }) {
  const color =
    item.type === "rest"
      ? "oklch(55% 0.05 250)"
      : item.type === "dotted"
        ? "oklch(75% 0.12 200)"
        : "oklch(70% 0.15 250)";

  return (
    <g>
      {/* Note symbol */}
      <text
        x={x + NOTE_WIDTH / 2}
        y={32}
        textAnchor="middle"
        fill={color}
        fontSize={22}
        fontFamily="serif"
      >
        {item.symbol}
      </text>
      {/* Label below */}
      <text
        x={x + NOTE_WIDTH / 2}
        y={52}
        textAnchor="middle"
        fill="oklch(45% 0.02 250)"
        fontSize={8}
        fontFamily="system-ui, sans-serif"
      >
        {item.label}
      </text>
    </g>
  );
}

// ─── Component ───

export function BeatCounter({
  onComplete,
  completed,
  lessonTitle,
  levelTitle,
  levelOrder,
}: BeatCounterProps) {
  const [sequence, setSequence] = useState<NoteItem[]>(() => generateSequence());
  const [input, setInput] = useState("");
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(completed);
  const completedRef = useRef(false);
  const [explanation, setExplanation] = useState<{
    question: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  } | null>(null);

  const correct = totalBeats(sequence);
  const svgWidth = Math.max(sequence.length * NOTE_WIDTH + 16, 200);

  const nextRound = useCallback(() => {
    setSequence(generateSequence());
    setInput("");
    setFeedback(null);
  }, []);

  const handleCheck = useCallback(() => {
    const userVal = parseFloat(input);
    if (isNaN(userVal)) return;

    const isCorrect = Math.abs(userVal - correct) < 0.01;

    setFeedback(isCorrect ? "correct" : "wrong");

    const seqDescription = sequence.map((n) => n.label).join(" + ");

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);

      setExplanation({
        question: `Count the total beats: ${seqDescription}`,
        studentAnswer: `${userVal} beats`,
        correctAnswer: `${formatBeats(correct)} beats`,
        isCorrect: true,
      });

      if (newStreak >= 3 && !completedRef.current) {
        completedRef.current = true;
        setTimeout(() => {
          setDone(true);
          onComplete();
        }, 600);
      } else {
        // Move to next after a pause
        setTimeout(nextRound, 1200);
      }
    } else {
      setStreak(0);

      setExplanation({
        question: `Count the total beats: ${seqDescription}`,
        studentAnswer: `${userVal} beats`,
        correctAnswer: `${formatBeats(correct)} beats`,
        isCorrect: false,
      });
    }
  }, [input, correct, sequence, streak, onComplete, nextRound]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleCheck();
    },
    [handleCheck]
  );

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-4">
      <h3 className="mb-1 text-sm font-semibold text-text-primary">
        Count the Beats
      </h3>
      <p className="mb-3 text-xs text-text-muted">
        Add up the total beats in each sequence. Get 3 in a row to complete.
      </p>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-2 py-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-surface-900">
              <Check className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-green-400">
              Beat counting complete!
            </p>
          </motion.div>
        ) : (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Streak indicator */}
            <div className="mb-3 flex items-center gap-1.5">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    i < streak ? "bg-green-500" : "bg-surface-600"
                  }`}
                />
              ))}
              <span className="ml-2 text-xs text-text-muted">{streak}/3</span>
            </div>

            {/* Note sequence SVG */}
            <div className="mb-4 overflow-x-auto rounded-lg bg-surface-700/30 py-2">
              <svg
                width={svgWidth}
                height={NOTE_HEIGHT}
                viewBox={`0 0 ${svgWidth} ${NOTE_HEIGHT}`}
                className="min-w-fit"
              >
                {sequence.map((item, i) => (
                  <NoteSymbol
                    key={`${i}-${item.label}`}
                    item={item}
                    x={8 + i * NOTE_WIDTH}
                  />
                ))}
              </svg>
            </div>

            {/* Input area */}
            <div className="flex items-center gap-3">
              <label className="text-xs text-text-secondary">Total beats:</label>
              <input
                type="number"
                step="0.25"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setFeedback(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="?"
                className={`w-24 rounded-lg border bg-surface-700 px-3 py-1.5 font-mono text-sm text-text-primary outline-none placeholder:text-text-muted/40 ${
                  feedback === "correct"
                    ? "border-green-500"
                    : feedback === "wrong"
                      ? "border-red-500"
                      : "border-surface-600 focus:border-accent-400"
                }`}
              />
              <button
                onClick={handleCheck}
                disabled={!input.trim()}
                className="rounded-lg bg-accent-500 px-4 py-1.5 text-xs font-medium text-surface-900 transition-colors hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Check
              </button>

              {feedback === "wrong" && (
                <button
                  onClick={nextRound}
                  className="rounded-lg bg-surface-700 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-600"
                >
                  Skip
                </button>
              )}
            </div>

            {/* Feedback */}
            {feedback === "correct" && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-xs font-medium text-green-400"
              >
                Correct! {formatBeats(correct)} beats
              </motion.p>
            )}
            {feedback === "wrong" && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-xs font-medium text-red-400"
              >
                Not quite — the answer is {formatBeats(correct)} beats. Try the next one!
              </motion.p>
            )}

            {/* Exercise explanation */}
            <AnimatePresence>
              {explanation && (
                <ExerciseExplanation
                  exerciseTitle="Count the Beats"
                  exerciseType="theory"
                  question={explanation.question}
                  studentAnswer={explanation.studentAnswer}
                  correctAnswer={explanation.correctAnswer}
                  isCorrect={explanation.isCorrect}
                  lessonTitle={lessonTitle}
                  levelTitle={levelTitle}
                  levelOrder={levelOrder}
                  onClose={() => setExplanation(null)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
