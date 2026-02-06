"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Play, RotateCcw } from "lucide-react";
import { ExerciseExplanation } from "@/components/exercises/exercise-explanation";

// ─── Types ───

interface TimeSigIdentifierProps {
  onComplete: () => void;
  completed: boolean;
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
}

type TimeSig = "4/4" | "3/4" | "6/8" | "2/4";

type StressLevel = "strong" | "medium" | "weak";

interface TimeSigDef {
  sig: TimeSig;
  pattern: StressLevel[];
  beatDuration: number; // seconds per beat at BPM 100
}

// ─── Beat patterns ───

const TIME_SIGS: TimeSigDef[] = [
  {
    sig: "4/4",
    pattern: ["strong", "weak", "medium", "weak"],
    beatDuration: 60 / 100,
  },
  {
    sig: "3/4",
    pattern: ["strong", "weak", "weak"],
    beatDuration: 60 / 100,
  },
  {
    sig: "6/8",
    pattern: ["strong", "weak", "weak", "medium", "weak", "weak"],
    beatDuration: 60 / 150, // faster subdivision for eighth notes
  },
  {
    sig: "2/4",
    pattern: ["strong", "weak"],
    beatDuration: 60 / 100,
  },
];

const CHOICES: TimeSig[] = ["4/4", "3/4", "6/8", "2/4"];

const STRESS_AUDIO: Record<StressLevel, { freq: number; gain: number }> = {
  strong: { freq: 1000, gain: 0.6 },
  medium: { freq: 900, gain: 0.35 },
  weak: { freq: 800, gain: 0.15 },
};

// ─── Audio ───

function playTimeSig(
  ctx: AudioContext,
  def: TimeSigDef,
  measures: number
): { stop: () => void; durationMs: number } {
  let stopped = false;
  const sources: OscillatorNode[] = [];

  let time = ctx.currentTime + 0.05;

  for (let m = 0; m < measures; m++) {
    for (const stress of def.pattern) {
      if (stopped) break;
      const { freq, gain: gainVal } = STRESS_AUDIO[stress];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = freq;
      osc.type = "sine";

      gain.gain.setValueAtTime(gainVal, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

      osc.start(time);
      osc.stop(time + 0.12);
      sources.push(osc);

      time += def.beatDuration;
    }
  }

  const durationMs = def.pattern.length * measures * def.beatDuration * 1000 + 200;

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

function pickTimeSig(previous: TimeSig | null): TimeSigDef {
  const pool = TIME_SIGS.filter((t) => t.sig !== previous);
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Component ───

export function TimeSigIdentifier({
  onComplete,
  completed,
  lessonTitle,
  levelTitle,
  levelOrder,
}: TimeSigIdentifierProps) {
  const [current, setCurrent] = useState<TimeSigDef>(() => pickTimeSig(null));
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<TimeSig | null>(null);
  const [done, setDone] = useState(completed);
  const [playing, setPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
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

  const handlePlay = useCallback(() => {
    playbackRef.current?.stop();
    const ctx = getAudioCtx();
    setPlaying(true);
    setHasPlayed(true);
    const pb = playTimeSig(ctx, current, 2);
    playbackRef.current = pb;
    setTimeout(() => setPlaying(false), pb.durationMs);
  }, [current, getAudioCtx]);

  const nextRound = useCallback(() => {
    setCurrent((prev) => pickTimeSig(prev.sig));
    setFeedback(null);
    setSelectedChoice(null);
    setHasPlayed(false);
  }, []);

  const handleSelect = useCallback(
    (choice: TimeSig) => {
      if (feedback !== null) return;

      setSelectedChoice(choice);
      const isCorrect = choice === current.sig;
      setFeedback(isCorrect ? "correct" : "wrong");

      const stressDescription = current.pattern
        .map((s) => (s === "strong" ? "S" : s === "medium" ? "M" : "w"))
        .join("-");

      if (isCorrect) {
        const newStreak = streak + 1;
        setStreak(newStreak);

        setExplanation({
          question: `Identify the time signature from the accent pattern: ${stressDescription}`,
          studentAnswer: choice,
          correctAnswer: current.sig,
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
          question: `Identify the time signature from the accent pattern: ${stressDescription}`,
          studentAnswer: choice,
          correctAnswer: current.sig,
          isCorrect: false,
        });
      }
    },
    [feedback, current, streak, onComplete, nextRound]
  );

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-4">
      <h3 className="mb-1 text-sm font-semibold text-text-primary">
        Identify the Time Signature
      </h3>
      <p className="mb-3 text-xs text-text-muted">
        Listen to the accented beat pattern, then pick the correct time signature. Get 3 in a row to complete.
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
              Time signature identification complete!
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

            {/* Play controls */}
            <div className="mb-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handlePlay}
                disabled={playing}
                className="flex items-center gap-1.5 rounded-lg bg-accent-500 px-4 py-2 text-xs font-medium text-surface-900 transition-colors hover:bg-accent-400 disabled:opacity-50"
              >
                {playing ? (
                  <>
                    <span className="h-3 w-3 animate-pulse rounded-full bg-surface-900/50" />
                    Playing...
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    {hasPlayed ? "Replay" : "Play Pattern"}
                  </>
                )}
              </button>

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

            {/* Time signature choices */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CHOICES.map((sig) => {
                const isSelected = selectedChoice === sig;
                const borderColor =
                  isSelected && feedback === "correct"
                    ? "border-green-500 bg-green-500/10"
                    : isSelected && feedback === "wrong"
                      ? "border-red-500 bg-red-500/10"
                      : feedback !== null && sig === current.sig
                        ? "border-green-500/50 bg-green-500/5"
                        : "border-surface-600 hover:border-surface-400";

                return (
                  <button
                    key={sig}
                    type="button"
                    onClick={() => handleSelect(sig)}
                    disabled={feedback !== null || !hasPlayed}
                    className={`rounded-lg border px-4 py-3 text-center font-mono text-lg font-bold transition-colors disabled:cursor-not-allowed ${borderColor} ${
                      !hasPlayed && feedback === null ? "opacity-40" : ""
                    }`}
                  >
                    <span className="text-text-primary">{sig}</span>
                  </button>
                );
              })}
            </div>

            {!hasPlayed && (
              <p className="mt-2 text-center text-xs text-text-muted">
                Press Play to hear the pattern first
              </p>
            )}

            {/* Feedback text */}
            {feedback === "correct" && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-xs font-medium text-green-400"
              >
                Correct! That&apos;s {current.sig} time.
              </motion.p>
            )}
            {feedback === "wrong" && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-xs font-medium text-red-400"
              >
                Not quite — that was {current.sig}. Listen for the accent pattern!
              </motion.p>
            )}

            {/* Exercise explanation */}
            <AnimatePresence>
              {explanation && (
                <ExerciseExplanation
                  exerciseTitle="Identify Time Signature"
                  exerciseType="ear"
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
