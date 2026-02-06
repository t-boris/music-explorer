"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Play, RotateCcw } from "lucide-react";
import { ExerciseExplanation } from "@/components/exercises/exercise-explanation";

// ─── Types ───

interface ConsonanceJudgeProps {
  onComplete: () => void;
  completed: boolean;
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
}

type ConsonanceCategory = "consonant" | "mild" | "dissonant";

interface IntervalDef {
  name: string;
  abbreviation: string;
  semitones: number;
  category: ConsonanceCategory;
  ratio: string;
}

// ─── Interval data with consonance classification ───

const INTERVALS: IntervalDef[] = [
  { name: "Perfect Unison", abbreviation: "P1", semitones: 0, category: "consonant", ratio: "1:1" },
  { name: "Minor Second", abbreviation: "m2", semitones: 1, category: "dissonant", ratio: "16:15" },
  { name: "Major Second", abbreviation: "M2", semitones: 2, category: "mild", ratio: "9:8" },
  { name: "Minor Third", abbreviation: "m3", semitones: 3, category: "consonant", ratio: "6:5" },
  { name: "Major Third", abbreviation: "M3", semitones: 4, category: "consonant", ratio: "5:4" },
  { name: "Perfect Fourth", abbreviation: "P4", semitones: 5, category: "consonant", ratio: "4:3" },
  { name: "Tritone", abbreviation: "TT", semitones: 6, category: "dissonant", ratio: "45:32" },
  { name: "Perfect Fifth", abbreviation: "P5", semitones: 7, category: "consonant", ratio: "3:2" },
  { name: "Minor Sixth", abbreviation: "m6", semitones: 8, category: "mild", ratio: "8:5" },
  { name: "Major Sixth", abbreviation: "M6", semitones: 9, category: "consonant", ratio: "5:3" },
  { name: "Minor Seventh", abbreviation: "m7", semitones: 10, category: "dissonant", ratio: "16:9" },
  { name: "Major Seventh", abbreviation: "M7", semitones: 11, category: "dissonant", ratio: "15:8" },
  { name: "Perfect Octave", abbreviation: "P8", semitones: 12, category: "consonant", ratio: "2:1" },
];

const CATEGORY_DISPLAY: Record<ConsonanceCategory, { label: string; color: string; bgColor: string }> = {
  consonant: { label: "Consonant", color: "text-green-400", bgColor: "border-green-500 bg-green-500/10 hover:bg-green-500/20" },
  mild: { label: "Mild Dissonance", color: "text-yellow-400", bgColor: "border-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20" },
  dissonant: { label: "Dissonant", color: "text-red-400", bgColor: "border-red-500 bg-red-500/10 hover:bg-red-500/20" },
};

const CHOICES: ConsonanceCategory[] = ["consonant", "mild", "dissonant"];

// ─── Audio helpers ───

function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function playHarmonicInterval(ctx: AudioContext, semitones: number): number {
  const rootMidi = 60; // C4
  const rootFreq = midiToFrequency(rootMidi);
  const intervalFreq = midiToFrequency(rootMidi + semitones);
  const now = ctx.currentTime;
  const duration = 1.2;

  // Play both notes simultaneously (harmonic interval)
  for (const freq of [rootFreq, intervalFreq]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gain.gain.setValueAtTime(0.25, now + duration - 0.1);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  return duration * 1000 + 100;
}

// ─── Round generation ───

function pickInterval(previousSemitones: number | null): IntervalDef {
  let pool = INTERVALS.filter((i) => i.semitones !== previousSemitones);
  if (pool.length === 0) pool = INTERVALS;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Component ───

export function ConsonanceJudge({
  onComplete,
  completed,
  lessonTitle,
  levelTitle,
  levelOrder,
}: ConsonanceJudgeProps) {
  const [current, setCurrent] = useState<IntervalDef>(() => pickInterval(null));
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<ConsonanceCategory | null>(null);
  const [done, setDone] = useState(completed);
  const [playing, setPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const completedRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
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
    const ctx = getAudioCtx();
    setPlaying(true);
    setHasPlayed(true);
    const durationMs = playHarmonicInterval(ctx, current.semitones);
    setTimeout(() => setPlaying(false), durationMs);
  }, [current.semitones, getAudioCtx]);

  const nextRound = useCallback(() => {
    setCurrent((prev) => pickInterval(prev.semitones));
    setFeedback(null);
    setSelectedChoice(null);
    setHasPlayed(false);
  }, []);

  const handleSelect = useCallback(
    (choice: ConsonanceCategory) => {
      if (feedback !== null) return;

      setSelectedChoice(choice);
      const isCorrect = choice === current.category;
      setFeedback(isCorrect ? "correct" : "wrong");

      const correctDisplay = CATEGORY_DISPLAY[current.category];
      const chosenDisplay = CATEGORY_DISPLAY[choice];

      if (isCorrect) {
        const newStreak = streak + 1;
        setStreak(newStreak);

        setExplanation({
          question: `Classify the ${current.name} (${current.abbreviation}, ratio ${current.ratio})`,
          studentAnswer: chosenDisplay.label,
          correctAnswer: `${correctDisplay.label} — ratio ${current.ratio} is ${current.category === "consonant" ? "simple" : current.category === "mild" ? "moderately complex" : "complex"}`,
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
          question: `Classify the ${current.name} (${current.abbreviation}, ratio ${current.ratio})`,
          studentAnswer: chosenDisplay.label,
          correctAnswer: `${correctDisplay.label} — the ${current.name} has a ratio of ${current.ratio}, which sounds ${current.category}`,
          isCorrect: false,
        });
      }
    },
    [feedback, current, streak, onComplete, nextRound]
  );

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-4">
      <h3 className="mb-1 text-sm font-semibold text-text-primary">
        Consonance vs Dissonance
      </h3>
      <p className="mb-3 text-xs text-text-muted">
        Listen to two notes played together and classify the interval. Get 3 in a row to complete.
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
              Consonance/dissonance training complete!
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
                    {hasPlayed ? "Replay" : "Play Interval"}
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

            {/* Category choices */}
            <div className="grid grid-cols-3 gap-2">
              {CHOICES.map((category) => {
                const display = CATEGORY_DISPLAY[category];
                const isSelected = selectedChoice === category;
                const isCorrectChoice = category === current.category;

                let borderColor: string;
                if (isSelected && feedback === "correct") {
                  borderColor = "border-green-500 bg-green-500/15 ring-2 ring-green-500/30";
                } else if (isSelected && feedback === "wrong") {
                  borderColor = "border-red-500 bg-red-500/15";
                } else if (feedback !== null && isCorrectChoice) {
                  borderColor = "border-green-500/50 bg-green-500/5";
                } else {
                  borderColor = display.bgColor;
                }

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleSelect(category)}
                    disabled={feedback !== null || !hasPlayed}
                    className={`rounded-lg border-2 px-3 py-3 text-center transition-all disabled:cursor-not-allowed ${borderColor} ${
                      !hasPlayed && feedback === null ? "opacity-40" : ""
                    }`}
                  >
                    <div className={`text-sm font-bold ${display.color}`}>
                      {display.label}
                    </div>
                    <div className="mt-0.5 text-[10px] text-text-muted">
                      {category === "consonant" && "Stable, blended"}
                      {category === "mild" && "Slightly tense"}
                      {category === "dissonant" && "Tense, clashing"}
                    </div>
                  </button>
                );
              })}
            </div>

            {!hasPlayed && (
              <p className="mt-2 text-center text-xs text-text-muted">
                Press Play to hear two notes together
              </p>
            )}

            {/* Feedback text */}
            {feedback === "correct" && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-xs font-medium text-green-400"
              >
                Correct! The {current.name} ({current.ratio}) is {CATEGORY_DISPLAY[current.category].label.toLowerCase()}.
              </motion.p>
            )}
            {feedback === "wrong" && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-xs font-medium text-red-400"
              >
                That was a {current.name} ({current.ratio}) — classified as {CATEGORY_DISPLAY[current.category].label.toLowerCase()}.
              </motion.p>
            )}

            {/* Exercise explanation */}
            <AnimatePresence>
              {explanation && (
                <ExerciseExplanation
                  exerciseTitle="Consonance vs Dissonance"
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
