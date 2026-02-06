"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Play, RotateCcw } from "lucide-react";
import { ExerciseExplanation } from "@/components/exercises/exercise-explanation";

// ─── Types ───

interface RhythmPatternMatcherProps {
  onComplete: () => void;
  completed: boolean;
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
}

interface RhythmNote {
  symbol: string;
  label: string;
  beats: number;
}

// ─── Note pool ───

const NOTE_POOL: RhythmNote[] = [
  { symbol: "𝅝", label: "whole", beats: 4 },
  { symbol: "𝅗𝅥", label: "half", beats: 2 },
  { symbol: "♩", label: "quarter", beats: 1 },
  { symbol: "♩.", label: "dotted quarter", beats: 1.5 },
  { symbol: "♪", label: "eighth", beats: 0.5 },
];

// ─── Pattern generation ───

function generatePattern(noteCount: number): RhythmNote[] {
  // Build a pattern of exactly noteCount notes summing to 4 beats
  for (let attempt = 0; attempt < 200; attempt++) {
    const pattern: RhythmNote[] = [];
    let remaining = 4;

    for (let i = 0; i < noteCount; i++) {
      const isLast = i === noteCount - 1;
      const candidates = NOTE_POOL.filter((n) => {
        if (isLast) return Math.abs(n.beats - remaining) < 0.001;
        // Leave enough for at least 0.5 beats per remaining note
        const minRemaining = (noteCount - i - 1) * 0.5;
        return n.beats <= remaining - minRemaining && n.beats >= 0.5;
      });
      if (candidates.length === 0) break;
      const note = candidates[Math.floor(Math.random() * candidates.length)];
      pattern.push(note);
      remaining -= note.beats;
    }

    if (pattern.length === noteCount && Math.abs(remaining) < 0.001) {
      return pattern;
    }
  }

  // Fallback: 4 quarter notes
  return [NOTE_POOL[2], NOTE_POOL[2], NOTE_POOL[2], NOTE_POOL[2]];
}

function patternKey(pattern: RhythmNote[]): string {
  return pattern.map((n) => n.label).join("|");
}

function generateChoices(): { correct: RhythmNote[]; choices: RhythmNote[][] } {
  const noteCount = 3 + Math.floor(Math.random() * 3); // 3-5 notes
  const correct = generatePattern(noteCount);
  const correctKey = patternKey(correct);

  const choices: RhythmNote[][] = [correct];
  const usedKeys = new Set([correctKey]);

  // Generate distractors that also sum to 4 beats but differ
  let safety = 0;
  while (choices.length < 4 && safety < 100) {
    safety++;
    const distCount = 3 + Math.floor(Math.random() * 3);
    const distractor = generatePattern(distCount);
    const key = patternKey(distractor);
    if (!usedKeys.has(key)) {
      usedKeys.add(key);
      choices.push(distractor);
    }
  }

  // Fill remaining if needed
  while (choices.length < 4) {
    choices.push(generatePattern(4));
  }

  // Shuffle
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }

  return { correct, choices };
}

// ─── Audio playback ───

const BPM = 90;
const BEAT_DURATION = 60 / BPM; // seconds per beat

function playPattern(
  ctx: AudioContext,
  pattern: RhythmNote[]
): { stop: () => void } {
  let stopped = false;
  const sources: OscillatorNode[] = [];

  let time = ctx.currentTime + 0.05;

  pattern.forEach((note, i) => {
    if (stopped) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Downbeat (beat 1) gets higher pitch
    osc.frequency.value = i === 0 ? 1000 : 800;
    osc.type = "sine";

    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.start(time);
    osc.stop(time + 0.1);
    sources.push(osc);

    time += note.beats * BEAT_DURATION;
  });

  return {
    stop: () => {
      stopped = true;
      sources.forEach((s) => {
        try { s.stop(); } catch { /* already stopped */ }
      });
    },
  };
}

// ─── SVG rendering ───

const CELL_W = 52;
const CELL_H = 50;

function PatternCard({
  pattern,
  index,
  selected,
  feedback,
  onClick,
}: {
  pattern: RhythmNote[];
  index: number;
  selected: boolean;
  feedback: "correct" | "wrong" | null;
  onClick: () => void;
}) {
  const w = pattern.length * CELL_W + 16;
  const borderColor =
    selected && feedback === "correct"
      ? "border-green-500 bg-green-500/10"
      : selected && feedback === "wrong"
        ? "border-red-500 bg-red-500/10"
        : selected
          ? "border-accent-400"
          : "border-surface-600 hover:border-surface-400";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-2 py-2 transition-colors ${borderColor}`}
      aria-label={`Choice ${index + 1}: ${pattern.map((n) => n.label).join(", ")}`}
    >
      <svg width={w} height={CELL_H} viewBox={`0 0 ${w} ${CELL_H}`}>
        {pattern.map((note, i) => (
          <g key={i}>
            <text
              x={8 + i * CELL_W + CELL_W / 2}
              y={24}
              textAnchor="middle"
              fill="oklch(70% 0.15 250)"
              fontSize={20}
              fontFamily="serif"
            >
              {note.symbol}
            </text>
            <text
              x={8 + i * CELL_W + CELL_W / 2}
              y={42}
              textAnchor="middle"
              fill="oklch(45% 0.02 250)"
              fontSize={8}
              fontFamily="system-ui, sans-serif"
            >
              {note.label}
            </text>
          </g>
        ))}
      </svg>
    </button>
  );
}

// ─── Component ───

export function RhythmPatternMatcher({
  onComplete,
  completed,
  lessonTitle,
  levelTitle,
  levelOrder,
}: RhythmPatternMatcherProps) {
  const [round, setRound] = useState(() => generateChoices());
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [streak, setStreak] = useState(0);
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

  const handlePlay = useCallback(() => {
    playbackRef.current?.stop();
    const ctx = getAudioCtx();
    setPlaying(true);
    const pb = playPattern(ctx, round.correct);
    playbackRef.current = pb;

    // Estimate total duration
    const totalBeats = round.correct.reduce((s, n) => s + n.beats, 0);
    const totalMs = totalBeats * BEAT_DURATION * 1000 + 200;
    setTimeout(() => setPlaying(false), totalMs);
  }, [round.correct, getAudioCtx]);

  const nextRound = useCallback(() => {
    setRound(generateChoices());
    setSelectedIdx(null);
    setFeedback(null);
  }, []);

  const handleSelect = useCallback(
    (idx: number) => {
      if (feedback !== null) return; // already answered

      setSelectedIdx(idx);

      const chosen = round.choices[idx];
      const isCorrect = patternKey(chosen) === patternKey(round.correct);

      setFeedback(isCorrect ? "correct" : "wrong");

      const questionDesc = `Rhythm pattern: ${round.correct.map((n) => n.label).join(" → ")}`;
      const studentDesc = round.choices[idx].map((n) => n.label).join(" → ");
      const correctDesc = round.correct.map((n) => n.label).join(" → ");

      if (isCorrect) {
        const newStreak = streak + 1;
        setStreak(newStreak);

        setExplanation({
          question: questionDesc,
          studentAnswer: studentDesc,
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
          question: questionDesc,
          studentAnswer: studentDesc,
          correctAnswer: correctDesc,
          isCorrect: false,
        });
      }
    },
    [feedback, round, streak, onComplete, nextRound]
  );

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-4">
      <h3 className="mb-1 text-sm font-semibold text-text-primary">
        Rhythm Pattern Matcher
      </h3>
      <p className="mb-3 text-xs text-text-muted">
        Listen to the rhythm pattern, then pick the matching notation. Get 3 in a row to complete.
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
              Pattern matching complete!
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
                    Playing…
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    {selectedIdx !== null ? "Replay" : "Play Pattern"}
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

            {/* Choices */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {round.choices.map((pattern, idx) => (
                <PatternCard
                  key={`${idx}-${patternKey(pattern)}`}
                  pattern={pattern}
                  index={idx}
                  selected={selectedIdx === idx}
                  feedback={selectedIdx === idx ? feedback : null}
                  onClick={() => handleSelect(idx)}
                />
              ))}
            </div>

            {/* Feedback text */}
            {feedback === "correct" && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-xs font-medium text-green-400"
              >
                Correct! That&apos;s the right pattern.
              </motion.p>
            )}
            {feedback === "wrong" && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-xs font-medium text-red-400"
              >
                Not quite — listen again and try the next one!
              </motion.p>
            )}

            {/* Exercise explanation */}
            <AnimatePresence>
              {explanation && (
                <ExerciseExplanation
                  exerciseTitle="Rhythm Pattern Matcher"
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
