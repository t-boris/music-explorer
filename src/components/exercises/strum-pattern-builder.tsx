"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Play, RotateCcw } from "lucide-react";
import { ExerciseExplanation } from "@/components/exercises/exercise-explanation";

// ─── Types ───

interface StrumPatternBuilderProps {
  onComplete: () => void;
  completed: boolean;
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
}

type StrumType = "down" | "up" | "skip";

interface StrumProblem {
  timeSig: string;
  hint: string;
  beatLabels: string[];
  correct: StrumType[];
}

// ─── Problem pool ───

const PROBLEMS: StrumProblem[] = [
  {
    timeSig: "4/4",
    hint: "Basic alternating eighth notes",
    beatLabels: ["1", "+", "2", "+", "3", "+", "4", "+"],
    correct: ["down", "up", "down", "up", "down", "up", "down", "up"],
  },
  {
    timeSig: "4/4",
    hint: "Standard rock pattern (skip some upstrokes)",
    beatLabels: ["1", "+", "2", "+", "3", "+", "4", "+"],
    correct: ["down", "skip", "down", "up", "skip", "up", "down", "up"],
  },
  {
    timeSig: "3/4",
    hint: "Waltz: strong downstroke on 1, lighter on 2-3",
    beatLabels: ["1", "+", "2", "+", "3", "+"],
    correct: ["down", "skip", "down", "up", "down", "up"],
  },
  {
    timeSig: "6/8",
    hint: "Flowing feel: all downstrokes",
    beatLabels: ["1", "2", "3", "4", "5", "6"],
    correct: ["down", "down", "down", "down", "down", "down"],
  },
  {
    timeSig: "4/4",
    hint: "Island strum (reggae feel)",
    beatLabels: ["1", "+", "2", "+", "3", "+", "4", "+"],
    correct: ["skip", "skip", "skip", "up", "skip", "up", "skip", "up"],
  },
  {
    timeSig: "3/4",
    hint: "Simple waltz: one downstroke per beat",
    beatLabels: ["1", "2", "3"],
    correct: ["down", "down", "down"],
  },
  {
    timeSig: "2/4",
    hint: "March: down-up on each beat",
    beatLabels: ["1", "+", "2", "+"],
    correct: ["down", "up", "down", "up"],
  },
  {
    timeSig: "6/8",
    hint: "Compound duple: accent groups of 3",
    beatLabels: ["1", "2", "3", "4", "5", "6"],
    correct: ["down", "up", "up", "down", "up", "up"],
  },
];

const STRUM_CYCLE: StrumType[] = ["skip", "down", "up"];

const STRUM_DISPLAY: Record<StrumType, { symbol: string; color: string }> = {
  down: { symbol: "\u2193", color: "bg-accent-500 text-surface-900 border-accent-400" },
  up: { symbol: "\u2191", color: "bg-sky-400 text-surface-900 border-sky-300" },
  skip: { symbol: "\u00b7", color: "bg-surface-600 text-text-muted border-surface-500" },
};

// ─── Audio ───

function playStrumPattern(
  ctx: AudioContext,
  pattern: StrumType[]
): { stop: () => void; durationMs: number } {
  let stopped = false;
  const sources: OscillatorNode[] = [];
  const beatDuration = 60 / 200; // eighth note at 100 BPM = 200 subdivisions/min
  let time = ctx.currentTime + 0.05;

  for (const strum of pattern) {
    if (stopped) break;

    if (strum !== "skip") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = strum === "down" ? 1000 : 800;
      osc.type = "sine";

      const gainVal = strum === "down" ? 0.4 : 0.2;
      gain.gain.setValueAtTime(gainVal, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

      osc.start(time);
      osc.stop(time + 0.1);
      sources.push(osc);
    }

    time += beatDuration;
  }

  const durationMs = pattern.length * beatDuration * 1000 + 200;

  return {
    stop: () => {
      stopped = true;
      sources.forEach((s) => {
        try { s.stop(); } catch { /* already stopped */ }
      });
    },
    durationMs,
  };
}

// ─── Random pick avoiding repeats ───

function pickProblem(previousHint: string | null): StrumProblem {
  const pool = PROBLEMS.filter((p) => p.hint !== previousHint);
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Component ───

export function StrumPatternBuilder({
  onComplete,
  completed,
  lessonTitle,
  levelTitle,
  levelOrder,
}: StrumPatternBuilderProps) {
  const [problem, setProblem] = useState<StrumProblem>(() => pickProblem(null));
  const [userPattern, setUserPattern] = useState<StrumType[]>(() =>
    Array(problem.correct.length).fill("skip") as StrumType[]
  );
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(completed);
  const [playing, setPlaying] = useState(false);
  const completedRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playbackRef = useRef<{ stop: () => void } | null>(null);
  const [explanation, setExplanation] = useState<{
    question: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  } | null>(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const handleCycleSlot = useCallback(
    (index: number) => {
      if (feedback !== null) return;
      setUserPattern((prev) => {
        const next = [...prev];
        const currentIdx = STRUM_CYCLE.indexOf(next[index]);
        next[index] = STRUM_CYCLE[(currentIdx + 1) % STRUM_CYCLE.length];
        return next;
      });
    },
    [feedback]
  );

  const handlePlay = useCallback(() => {
    playbackRef.current?.stop();
    const ctx = getAudioCtx();
    setPlaying(true);
    const pb = playStrumPattern(ctx, userPattern);
    playbackRef.current = pb;
    setTimeout(() => setPlaying(false), pb.durationMs);
  }, [userPattern, getAudioCtx]);

  const nextRound = useCallback(() => {
    setProblem((prev) => {
      const next = pickProblem(prev.hint);
      setUserPattern(Array(next.correct.length).fill("skip") as StrumType[]);
      return next;
    });
    setFeedback(null);
  }, []);

  const handleCheck = useCallback(() => {
    const isCorrect =
      userPattern.length === problem.correct.length &&
      userPattern.every((s, i) => s === problem.correct[i]);

    setFeedback(isCorrect ? "correct" : "wrong");

    const formatPattern = (p: StrumType[]) =>
      p.map((s) => STRUM_DISPLAY[s].symbol).join(" ");

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);

      setExplanation({
        question: `Build the strum pattern for ${problem.timeSig} — ${problem.hint}`,
        studentAnswer: formatPattern(userPattern),
        correctAnswer: formatPattern(problem.correct),
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
      setExplanation({
        question: `Build the strum pattern for ${problem.timeSig} — ${problem.hint}`,
        studentAnswer: formatPattern(userPattern),
        correctAnswer: formatPattern(problem.correct),
        isCorrect: false,
      });
    }
  }, [userPattern, problem, streak, onComplete, nextRound]);

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-4">
      <h3 className="mb-1 text-sm font-semibold text-text-primary">
        Strum Pattern Builder
      </h3>
      <p className="mb-3 text-xs text-text-muted">
        Build the correct strum pattern using downstrokes, upstrokes, and skips. Get 3 in a row to complete.
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
              Strum pattern building complete!
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

            {/* Problem header */}
            <div className="mb-4 rounded-lg bg-surface-700/50 px-4 py-3 text-center">
              <span className="font-mono text-lg font-bold text-text-primary">
                {problem.timeSig}
              </span>
              <span className="mx-2 text-text-muted">—</span>
              <span className="text-sm text-text-secondary">{problem.hint}</span>
            </div>

            {/* Strum slots */}
            <div className="mb-2 flex items-start justify-center gap-1.5">
              {userPattern.map((strum, i) => {
                const display = STRUM_DISPLAY[strum];
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCycleSlot(i)}
                      disabled={feedback !== null}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 text-lg font-bold transition-all disabled:cursor-not-allowed ${display.color} ${
                        feedback !== null ? "" : "hover:scale-110"
                      }`}
                      aria-label={`Slot ${i + 1}: ${strum}. Click to cycle.`}
                    >
                      {display.symbol}
                    </button>
                    <span className="text-[10px] text-text-muted">
                      {problem.beatLabels[i]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            {feedback === null && (
              <div className="mb-3 flex items-center justify-center gap-3 text-[10px] text-text-muted">
                <span>
                  <span className="font-bold text-accent-400">{"\u2193"}</span> Down
                </span>
                <span>
                  <span className="font-bold text-sky-400">{"\u2191"}</span> Up
                </span>
                <span>
                  <span className="font-bold text-text-muted">{"\u00b7"}</span> Skip
                </span>
              </div>
            )}

            {/* Correct answer reveal on wrong */}
            {feedback === "wrong" && (
              <div className="mb-3">
                <p className="mb-1.5 text-center text-xs text-text-muted">Correct pattern:</p>
                <div className="flex items-start justify-center gap-1.5">
                  {problem.correct.map((strum, i) => {
                    const display = STRUM_DISPLAY[strum];
                    return (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 text-sm font-bold ${display.color}`}
                        >
                          {display.symbol}
                        </div>
                        <span className="text-[10px] text-text-muted">
                          {problem.beatLabels[i]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handlePlay}
                disabled={playing}
                className="flex items-center gap-1.5 rounded-lg bg-surface-700 px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-600 disabled:opacity-50"
              >
                {playing ? (
                  <>
                    <span className="h-3 w-3 animate-pulse rounded-full bg-accent-400/50" />
                    Playing...
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    Preview
                  </>
                )}
              </button>

              {feedback === null && (
                <button
                  type="button"
                  onClick={handleCheck}
                  className="rounded-lg bg-accent-500 px-4 py-2 text-xs font-medium text-surface-900 transition-colors hover:bg-accent-400"
                >
                  Check
                </button>
              )}

              {feedback === "wrong" && (
                <button
                  type="button"
                  onClick={nextRound}
                  className="flex items-center gap-1.5 rounded-lg bg-surface-700 px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-600"
                >
                  <RotateCcw className="h-3 w-3" />
                  Next
                </button>
              )}
            </div>

            {/* Feedback text */}
            {feedback === "correct" && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-center text-xs font-medium text-green-400"
              >
                Correct! That&apos;s the right strum pattern.
              </motion.p>
            )}
            {feedback === "wrong" && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-center text-xs font-medium text-red-400"
              >
                Not quite — check the correct pattern above and try the next one!
              </motion.p>
            )}

            {/* Exercise explanation */}
            <AnimatePresence>
              {explanation && (
                <ExerciseExplanation
                  exerciseTitle="Strum Pattern Builder"
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
