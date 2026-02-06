"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Play, RotateCcw } from "lucide-react";
import { ExerciseExplanation } from "@/components/exercises/exercise-explanation";

// ─── Types ───

interface BeatStressMapperProps {
  onComplete: () => void;
  completed: boolean;
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
}

type StressLevel = "S" | "M" | "w";

interface StressProblem {
  timeSig: string;
  beats: number;
  correct: StressLevel[];
}

// ─── Problem pool ───

const PROBLEMS: StressProblem[] = [
  { timeSig: "4/4", beats: 4, correct: ["S", "w", "M", "w"] },
  { timeSig: "3/4", beats: 3, correct: ["S", "w", "w"] },
  { timeSig: "6/8", beats: 6, correct: ["S", "w", "w", "M", "w", "w"] },
  { timeSig: "2/4", beats: 2, correct: ["S", "w"] },
  { timeSig: "2/2", beats: 2, correct: ["S", "w"] },
];

const STRESS_CYCLE: StressLevel[] = ["w", "S", "M"];

const STRESS_COLORS: Record<StressLevel, string> = {
  S: "bg-accent-500 text-surface-900 border-accent-400",
  M: "bg-amber-400 text-surface-900 border-amber-300",
  w: "bg-surface-600 text-text-muted border-surface-500",
};

const STRESS_LABELS: Record<StressLevel, string> = {
  S: "Strong",
  M: "Medium",
  w: "Weak",
};

const STRESS_AUDIO: Record<StressLevel, { freq: number; gain: number }> = {
  S: { freq: 1000, gain: 0.6 },
  M: { freq: 900, gain: 0.35 },
  w: { freq: 800, gain: 0.15 },
};

// ─── Random pick avoiding repeats ───

function pickProblem(previousSig: string | null): StressProblem {
  const pool = PROBLEMS.filter((p) => p.timeSig !== previousSig);
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Audio ───

function playStressPattern(
  ctx: AudioContext,
  pattern: StressLevel[]
): { stop: () => void; durationMs: number } {
  let stopped = false;
  const sources: OscillatorNode[] = [];
  const beatDuration = 60 / 100; // BPM 100
  let time = ctx.currentTime + 0.05;

  for (const stress of pattern) {
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

// ─── Component ───

export function BeatStressMapper({
  onComplete,
  completed,
  lessonTitle,
  levelTitle,
  levelOrder,
}: BeatStressMapperProps) {
  const [problem, setProblem] = useState<StressProblem>(() => pickProblem(null));
  const [userPattern, setUserPattern] = useState<StressLevel[]>(() =>
    Array(problem.beats).fill("w") as StressLevel[]
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

  const handleCycleBeat = useCallback(
    (index: number) => {
      if (feedback !== null) return;
      setUserPattern((prev) => {
        const next = [...prev];
        const currentIdx = STRESS_CYCLE.indexOf(next[index]);
        next[index] = STRESS_CYCLE[(currentIdx + 1) % STRESS_CYCLE.length];
        return next;
      });
    },
    [feedback]
  );

  const handlePlay = useCallback(() => {
    playbackRef.current?.stop();
    const ctx = getAudioCtx();
    setPlaying(true);
    const pb = playStressPattern(ctx, userPattern);
    playbackRef.current = pb;
    setTimeout(() => setPlaying(false), pb.durationMs);
  }, [userPattern, getAudioCtx]);

  const nextRound = useCallback(() => {
    setProblem((prev) => {
      const next = pickProblem(prev.timeSig);
      setUserPattern(Array(next.beats).fill("w") as StressLevel[]);
      return next;
    });
    setFeedback(null);
  }, []);

  const handleCheck = useCallback(() => {
    const isCorrect =
      userPattern.length === problem.correct.length &&
      userPattern.every((s, i) => s === problem.correct[i]);

    setFeedback(isCorrect ? "correct" : "wrong");

    const userDesc = userPattern.join("-");
    const correctDesc = problem.correct.join("-");

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);

      setExplanation({
        question: `Mark the stress pattern for ${problem.timeSig} time`,
        studentAnswer: userDesc,
        correctAnswer: correctDesc,
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
        question: `Mark the stress pattern for ${problem.timeSig} time`,
        studentAnswer: userDesc,
        correctAnswer: correctDesc,
        isCorrect: false,
      });
    }
  }, [userPattern, problem, streak, onComplete, nextRound]);

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-4">
      <h3 className="mb-1 text-sm font-semibold text-text-primary">
        Beat Stress Mapper
      </h3>
      <p className="mb-3 text-xs text-text-muted">
        Click each beat to set its stress level (Strong / Medium / Weak). Get 3 in a row to complete.
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
              Beat stress mapping complete!
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

            {/* Time signature display */}
            <div className="mb-4 text-center">
              <div className="inline-flex flex-col items-center rounded-lg bg-surface-700/50 px-6 py-3">
                <span className="font-serif text-3xl font-bold leading-none text-text-primary">
                  {problem.timeSig.split("/")[0]}
                </span>
                <div className="my-0.5 h-px w-8 bg-text-secondary" />
                <span className="font-serif text-3xl font-bold leading-none text-text-primary">
                  {problem.timeSig.split("/")[1]}
                </span>
              </div>
            </div>

            {/* Beat buttons */}
            <div className="mb-4 flex items-center justify-center gap-2">
              {userPattern.map((stress, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleCycleBeat(i)}
                  disabled={feedback !== null}
                  className={`flex h-12 w-12 flex-col items-center justify-center rounded-full border-2 text-xs font-bold transition-all disabled:cursor-not-allowed ${STRESS_COLORS[stress]} ${
                    feedback !== null ? "" : "hover:scale-110"
                  }`}
                  aria-label={`Beat ${i + 1}: ${STRESS_LABELS[stress]}. Click to cycle.`}
                >
                  <span className="text-sm">{stress}</span>
                  <span className="text-[9px] font-normal opacity-70">{i + 1}</span>
                </button>
              ))}
            </div>

            {/* Hint */}
            {feedback === null && (
              <p className="mb-3 text-center text-xs text-text-muted">
                Click beats to set their stress level
              </p>
            )}

            {/* Correct answer reveal on wrong */}
            {feedback === "wrong" && (
              <div className="mb-3">
                <p className="mb-1.5 text-center text-xs text-text-muted">Correct pattern:</p>
                <div className="flex items-center justify-center gap-2">
                  {problem.correct.map((stress, i) => (
                    <div
                      key={i}
                      className={`flex h-10 w-10 flex-col items-center justify-center rounded-full border-2 text-xs font-bold ${STRESS_COLORS[stress]}`}
                    >
                      <span className="text-sm">{stress}</span>
                      <span className="text-[9px] font-normal opacity-70">{i + 1}</span>
                    </div>
                  ))}
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
                Correct! {problem.timeSig} has the stress pattern {problem.correct.join("-")}.
              </motion.p>
            )}
            {feedback === "wrong" && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-center text-xs font-medium text-red-400"
              >
                Not quite — the correct pattern for {problem.timeSig} is{" "}
                {problem.correct.join("-")}.
              </motion.p>
            )}

            {/* Exercise explanation */}
            <AnimatePresence>
              {explanation && (
                <ExerciseExplanation
                  exerciseTitle="Beat Stress Mapper"
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
