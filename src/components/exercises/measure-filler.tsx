"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Play, Undo2, RotateCcw } from "lucide-react";
import { ExerciseExplanation } from "@/components/exercises/exercise-explanation";

// ─── Types ───

interface MeasureFillerProps {
  onComplete: () => void;
  completed: boolean;
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
}

interface MeasureNote {
  symbol: string;
  label: string;
  beats: number;
}

interface Problem {
  prefilled: MeasureNote[];
  prefilledBeats: number;
  /** The specific notes the user should add */
  answer: MeasureNote[];
  /** Constraint shown to the user */
  constraint: string;
}

// ─── Note definitions ───

const N = {
  whole: { symbol: "𝅝", label: "whole", beats: 4 } as MeasureNote,
  dottedHalf: { symbol: "𝅗𝅥.", label: "dotted half", beats: 3 } as MeasureNote,
  half: { symbol: "𝅗𝅥", label: "half", beats: 2 } as MeasureNote,
  quarter: { symbol: "♩", label: "quarter", beats: 1 } as MeasureNote,
  dottedQuarter: { symbol: "♩.", label: "dotted quarter", beats: 1.5 } as MeasureNote,
  eighth: { symbol: "♪", label: "eighth", beats: 0.5 } as MeasureNote,
};

const PALETTE: MeasureNote[] = [
  N.whole,
  N.dottedHalf,
  N.half,
  N.dottedQuarter,
  N.quarter,
  N.eighth,
];

// ─── Problems with specific target answers ───

const PROBLEMS: Problem[] = [
  {
    prefilled: [N.half],
    prefilledBeats: 2,
    answer: [N.half],
    constraint: "Use exactly 1 note",
  },
  {
    prefilled: [N.quarter, N.quarter],
    prefilledBeats: 2,
    answer: [N.half],
    constraint: "Use exactly 1 note",
  },
  {
    prefilled: [N.quarter],
    prefilledBeats: 1,
    answer: [N.dottedHalf],
    constraint: "Use exactly 1 note",
  },
  {
    prefilled: [N.half, N.quarter],
    prefilledBeats: 3,
    answer: [N.quarter],
    constraint: "Use exactly 1 note",
  },
  {
    prefilled: [N.dottedHalf],
    prefilledBeats: 3,
    answer: [N.eighth, N.eighth],
    constraint: "Use only eighth notes",
  },
  {
    prefilled: [N.half],
    prefilledBeats: 2,
    answer: [N.quarter, N.quarter],
    constraint: "Use only quarter notes",
  },
  {
    prefilled: [N.quarter],
    prefilledBeats: 1,
    answer: [N.quarter, N.half],
    constraint: "Use exactly 2 notes",
  },
  {
    prefilled: [N.dottedQuarter, N.eighth],
    prefilledBeats: 2,
    answer: [N.quarter, N.quarter],
    constraint: "Use only quarter notes",
  },
  {
    prefilled: [N.eighth, N.eighth],
    prefilledBeats: 1,
    answer: [N.dottedHalf],
    constraint: "Use exactly 1 note",
  },
  {
    prefilled: [N.half],
    prefilledBeats: 2,
    answer: [N.dottedQuarter, N.eighth],
    constraint: "Use exactly 2 notes (include a dotted note)",
  },
  {
    prefilled: [N.quarter, N.quarter, N.quarter],
    prefilledBeats: 3,
    answer: [N.eighth, N.eighth],
    constraint: "Use only eighth notes",
  },
  {
    prefilled: [N.eighth, N.eighth, N.quarter],
    prefilledBeats: 2,
    answer: [N.half],
    constraint: "Use the fewest notes possible",
  },
];

function pickProblem(usedIndices: Set<number>): { problem: Problem; index: number } {
  const available = PROBLEMS.map((_, i) => i).filter((i) => !usedIndices.has(i));
  const pool = available.length > 0 ? available : PROBLEMS.map((_, i) => i);
  const idx = pool[Math.floor(Math.random() * pool.length)];
  return { problem: PROBLEMS[idx], index: idx };
}

// ─── Answer matching ───

function notesMatch(a: MeasureNote[], b: MeasureNote[]): boolean {
  if (a.length !== b.length) return false;
  // Sort by beats then label for order-independent comparison
  const sort = (arr: MeasureNote[]) =>
    [...arr].sort((x, y) => x.beats - y.beats || x.label.localeCompare(y.label));
  const sa = sort(a);
  const sb = sort(b);
  return sa.every((n, i) => n.label === sb[i].label);
}

// ─── Audio playback ───

const BPM = 90;
const BEAT_DURATION = 60 / BPM;

function playMeasure(ctx: AudioContext, notes: MeasureNote[]): void {
  let time = ctx.currentTime + 0.05;

  notes.forEach((note, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = i === 0 ? 1000 : 800;
    osc.type = "sine";

    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.start(time);
    osc.stop(time + 0.1);

    time += note.beats * BEAT_DURATION;
  });
}

// ─── SVG Note display ───

const CELL_W = 52;
const CELL_H = 50;

function MeasureDisplay({
  prefilled,
  added,
}: {
  prefilled: MeasureNote[];
  added: MeasureNote[];
}) {
  const all = [...prefilled, ...added];
  const totalSlots = Math.max(all.length + 1, 4);
  const w = totalSlots * CELL_W + 16;

  return (
    <div className="overflow-x-auto rounded-lg bg-surface-700/30 py-2">
      <svg width={w} height={CELL_H} viewBox={`0 0 ${w} ${CELL_H}`}>
        {prefilled.map((note, i) => (
          <g key={`pre-${i}`}>
            <text
              x={8 + i * CELL_W + CELL_W / 2}
              y={24}
              textAnchor="middle"
              fill="oklch(55% 0.05 250)"
              fontSize={20}
              fontFamily="serif"
            >
              {note.symbol}
            </text>
            <text
              x={8 + i * CELL_W + CELL_W / 2}
              y={42}
              textAnchor="middle"
              fill="oklch(40% 0.02 250)"
              fontSize={8}
              fontFamily="system-ui, sans-serif"
            >
              {note.label}
            </text>
          </g>
        ))}
        {added.map((note, i) => (
          <g key={`add-${i}`}>
            <text
              x={8 + (prefilled.length + i) * CELL_W + CELL_W / 2}
              y={24}
              textAnchor="middle"
              fill="oklch(75% 0.15 200)"
              fontSize={20}
              fontFamily="serif"
            >
              {note.symbol}
            </text>
            <text
              x={8 + (prefilled.length + i) * CELL_W + CELL_W / 2}
              y={42}
              textAnchor="middle"
              fill="oklch(55% 0.08 200)"
              fontSize={8}
              fontFamily="system-ui, sans-serif"
            >
              {note.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── Component ───

export function MeasureFiller({
  onComplete,
  completed,
  lessonTitle,
  levelTitle,
  levelOrder,
}: MeasureFillerProps) {
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());
  const [current, setCurrent] = useState(() => pickProblem(new Set()));
  const [added, setAdded] = useState<MeasureNote[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [streak, setStreak] = useState(0);
  const [done, setDone] = useState(completed);
  const completedRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [explanation, setExplanation] = useState<{
    question: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  } | null>(null);

  const totalBeats = current.problem.prefilledBeats + added.reduce((s, n) => s + n.beats, 0);
  const remaining = 4 - totalBeats;

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const handlePlay = useCallback(() => {
    const ctx = getAudioCtx();
    playMeasure(ctx, [...current.problem.prefilled, ...added]);
  }, [current.problem.prefilled, added, getAudioCtx]);

  const handleAddNote = useCallback(
    (note: MeasureNote) => {
      if (feedback !== null) return;
      if (note.beats > remaining + 0.001) return;
      setAdded((prev) => [...prev, note]);
    },
    [feedback, remaining]
  );

  const handleRemoveLast = useCallback(() => {
    if (feedback !== null) return;
    setAdded((prev) => prev.slice(0, -1));
  }, [feedback]);

  const nextRound = useCallback(() => {
    const newUsed = new Set(usedIndices);
    newUsed.add(current.index);
    setUsedIndices(newUsed);
    const next = pickProblem(newUsed);
    setCurrent(next);
    setAdded([]);
    setFeedback(null);
  }, [usedIndices, current.index]);

  const handleCheck = useCallback(() => {
    const beatsCorrect = Math.abs(totalBeats - 4) < 0.001;
    const notesCorrect = notesMatch(added, current.problem.answer);
    const isCorrect = beatsCorrect && notesCorrect;

    setFeedback(isCorrect ? "correct" : "wrong");

    const preDesc = current.problem.prefilled.map((n) => n.label).join(" + ");
    const addedDesc = added.length > 0 ? added.map((n) => n.label).join(" + ") : "(nothing)";
    const answerDesc = current.problem.answer.map((n) => n.label).join(" + ");

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);

      setExplanation({
        question: `Fill the measure. Given: ${preDesc}. Constraint: ${current.problem.constraint}`,
        studentAnswer: addedDesc,
        correctAnswer: answerDesc,
        isCorrect: true,
      });

      if (newStreak >= 3 && !completedRef.current) {
        completedRef.current = true;
        setTimeout(() => {
          setDone(true);
          onComplete();
        }, 600);
      } else {
        setTimeout(nextRound, 1200);
      }
    } else {
      setStreak(0);

      const reason = !beatsCorrect
        ? `Total is ${totalBeats} beats, not 4.`
        : `Correct notes: ${answerDesc}`;

      setExplanation({
        question: `Fill the measure. Given: ${preDesc}. Constraint: ${current.problem.constraint}`,
        studentAnswer: `${addedDesc} (${totalBeats} beats total)`,
        correctAnswer: `${answerDesc} — ${reason}`,
        isCorrect: false,
      });
    }
  }, [totalBeats, current, added, streak, onComplete, nextRound]);

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-4">
      <h3 className="mb-1 text-sm font-semibold text-text-primary">
        Fill the Measure
      </h3>
      <p className="mb-3 text-xs text-text-muted">
        Complete the 4/4 measure using the specific notes described. Get 3 in a row to complete.
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
              Measure filling complete!
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

            {/* Constraint badge */}
            <div className="mb-3 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
              <span className="text-xs font-medium text-amber-400">
                Goal: {current.problem.constraint}
              </span>
            </div>

            {/* Measure display */}
            <div className="mb-3">
              <MeasureDisplay
                prefilled={current.problem.prefilled}
                added={added}
              />
            </div>

            {/* Beat progress bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Beats used</span>
                <span className="font-mono">
                  {Number.isInteger(totalBeats) ? totalBeats : totalBeats.toFixed(1)}/4
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-700">
                <motion.div
                  className={`h-full rounded-full transition-colors ${
                    Math.abs(totalBeats - 4) < 0.001
                      ? "bg-green-500"
                      : totalBeats > 4
                        ? "bg-red-500"
                        : "bg-accent-500"
                  }`}
                  initial={false}
                  animate={{ width: `${Math.min((totalBeats / 4) * 100, 100)}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
            </div>

            {/* Note palette */}
            <div className="mb-3 flex flex-wrap gap-1.5">
              {PALETTE.map((note) => {
                const disabled = feedback !== null || note.beats > remaining + 0.001;
                return (
                  <button
                    key={note.label}
                    type="button"
                    onClick={() => handleAddNote(note)}
                    disabled={disabled}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      disabled
                        ? "cursor-not-allowed border-surface-700 text-text-muted/30"
                        : "border-surface-600 text-text-primary hover:border-accent-400 hover:bg-surface-700"
                    }`}
                  >
                    <span className="mr-1 font-serif">{note.symbol}</span>
                    <span className="text-xs text-text-muted">{note.beats}b</span>
                  </button>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRemoveLast}
                disabled={added.length === 0 || feedback !== null}
                className="flex items-center gap-1 rounded-lg bg-surface-700 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Undo2 className="h-3 w-3" />
                Undo
              </button>

              <button
                type="button"
                onClick={handleCheck}
                disabled={added.length === 0 || feedback !== null}
                className="rounded-lg bg-accent-500 px-4 py-1.5 text-xs font-medium text-surface-900 transition-colors hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Check
              </button>

              <button
                type="button"
                onClick={handlePlay}
                className="flex items-center gap-1 rounded-lg bg-surface-700 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-600"
              >
                <Play className="h-3 w-3" />
                Play
              </button>

              {feedback === "wrong" && (
                <button
                  type="button"
                  onClick={nextRound}
                  className="flex items-center gap-1.5 rounded-lg bg-surface-700 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-600"
                >
                  <RotateCcw className="h-3 w-3" />
                  Next
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
                Correct! The measure has exactly 4 beats with the right notes.
              </motion.p>
            )}
            {feedback === "wrong" && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2"
              >
                <p className="text-xs font-medium text-red-400">
                  Not quite — the correct fill is{" "}
                  {current.problem.answer.map((n) => n.label).join(" + ")}.
                </p>
              </motion.div>
            )}

            {/* Exercise explanation */}
            <AnimatePresence>
              {explanation && (
                <ExerciseExplanation
                  exerciseTitle="Fill the Measure"
                  exerciseType="rhythm"
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
