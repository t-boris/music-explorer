"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Play, RotateCcw } from "lucide-react";
import { ExerciseExplanation } from "@/components/exercises/exercise-explanation";

// ─── Types ───

interface IntervalSongMatchProps {
  onComplete: () => void;
  completed: boolean;
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
}

interface SongReference {
  interval: string;
  abbreviation: string;
  semitones: number;
  song: string;
  direction: "ascending" | "descending";
}

// ─── Song reference data ───

const SONG_REFS: SongReference[] = [
  { interval: "Minor Second", abbreviation: "m2", semitones: 1, song: "Jaws theme", direction: "ascending" },
  { interval: "Major Second", abbreviation: "M2", semitones: 2, song: "Happy Birthday", direction: "ascending" },
  { interval: "Minor Third", abbreviation: "m3", semitones: 3, song: "Smoke on the Water", direction: "ascending" },
  { interval: "Major Third", abbreviation: "M3", semitones: 4, song: "When the Saints Go Marching In", direction: "ascending" },
  { interval: "Perfect Fourth", abbreviation: "P4", semitones: 5, song: "Here Comes the Bride", direction: "ascending" },
  { interval: "Tritone", abbreviation: "TT", semitones: 6, song: "The Simpsons theme", direction: "ascending" },
  { interval: "Perfect Fifth", abbreviation: "P5", semitones: 7, song: "Star Wars main theme", direction: "ascending" },
  { interval: "Minor Sixth", abbreviation: "m6", semitones: 8, song: "The Entertainer", direction: "ascending" },
  { interval: "Major Sixth", abbreviation: "M6", semitones: 9, song: "My Bonnie Lies Over the Ocean", direction: "ascending" },
  { interval: "Perfect Octave", abbreviation: "P8", semitones: 12, song: "Somewhere Over the Rainbow", direction: "ascending" },
];

// ─── Audio helpers ───

function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function playTone(ctx: AudioContext, freq: number, startTime: number, duration: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.35, startTime + 0.01);
  gain.gain.setValueAtTime(0.35, startTime + duration - 0.05);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

function playIntervalAudio(ctx: AudioContext, semitones: number): number {
  const rootMidi = 60; // C4
  const rootFreq = midiToFrequency(rootMidi);
  const intervalFreq = midiToFrequency(rootMidi + semitones);
  const now = ctx.currentTime;
  const noteDuration = 0.5;
  const gap = 0.15;

  playTone(ctx, rootFreq, now, noteDuration);
  playTone(ctx, intervalFreq, now + noteDuration + gap, noteDuration);

  return (2 * noteDuration + gap) * 1000 + 100;
}

// ─── Round generation ───

interface Round {
  correct: SongReference;
  choices: SongReference[];
}

function generateRound(previousSemitones: number | null): Round {
  let pool = SONG_REFS.filter((s) => s.semitones !== previousSemitones);
  if (pool.length === 0) pool = SONG_REFS;
  const correct = pool[Math.floor(Math.random() * pool.length)];

  // Build 4 choices including correct
  const choices: SongReference[] = [correct];
  const usedSemitones = new Set([correct.semitones]);

  const others = SONG_REFS.filter((s) => !usedSemitones.has(s.semitones));
  // Shuffle others
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }

  for (const candidate of others) {
    if (choices.length >= 4) break;
    choices.push(candidate);
  }

  // Shuffle choices
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }

  return { correct, choices };
}

// ─── Component ───

export function IntervalSongMatch({
  onComplete,
  completed,
  lessonTitle,
  levelTitle,
  levelOrder,
}: IntervalSongMatchProps) {
  const [round, setRound] = useState<Round>(() => generateRound(null));
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
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
    const durationMs = playIntervalAudio(ctx, round.correct.semitones);
    setTimeout(() => setPlaying(false), durationMs);
  }, [round.correct.semitones, getAudioCtx]);

  const nextRound = useCallback(() => {
    setRound((prev) => generateRound(prev.correct.semitones));
    setFeedback(null);
    setSelectedIdx(null);
    setHasPlayed(false);
  }, []);

  const handleSelect = useCallback(
    (idx: number) => {
      if (feedback !== null) return;

      setSelectedIdx(idx);
      const chosen = round.choices[idx];
      const isCorrect = chosen.semitones === round.correct.semitones;

      setFeedback(isCorrect ? "correct" : "wrong");

      if (isCorrect) {
        const newStreak = streak + 1;
        setStreak(newStreak);

        setExplanation({
          question: `Which song starts with this interval? (${round.correct.interval})`,
          studentAnswer: `"${chosen.song}" (${chosen.interval})`,
          correctAnswer: `"${round.correct.song}" (${round.correct.interval}, ${round.correct.semitones} semitones)`,
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
          question: `Which song starts with this interval? (${round.correct.interval})`,
          studentAnswer: `"${chosen.song}" (${chosen.interval}, ${chosen.semitones} semitones)`,
          correctAnswer: `"${round.correct.song}" (${round.correct.interval}, ${round.correct.semitones} semitones)`,
          isCorrect: false,
        });
      }
    },
    [feedback, round, streak, onComplete, nextRound]
  );

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-4">
      <h3 className="mb-1 text-sm font-semibold text-text-primary">
        Interval Song References
      </h3>
      <p className="mb-3 text-xs text-text-muted">
        Listen to an interval and match it to the song that opens with those same two notes. Get 3 in a row to complete.
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
              Interval song matching complete!
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

            {/* Song choices */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {round.choices.map((ref, idx) => {
                const isSelected = selectedIdx === idx;
                const isCorrectRef = ref.semitones === round.correct.semitones;
                const borderColor =
                  isSelected && feedback === "correct"
                    ? "border-green-500 bg-green-500/10"
                    : isSelected && feedback === "wrong"
                      ? "border-red-500 bg-red-500/10"
                      : feedback !== null && isCorrectRef
                        ? "border-green-500/50 bg-green-500/5"
                        : "border-surface-600 hover:border-surface-400";

                return (
                  <button
                    key={ref.abbreviation}
                    type="button"
                    onClick={() => handleSelect(idx)}
                    disabled={feedback !== null || !hasPlayed}
                    className={`rounded-lg border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed ${borderColor} ${
                      !hasPlayed && feedback === null ? "opacity-40" : ""
                    }`}
                  >
                    <div className="text-sm font-medium text-text-primary">
                      &ldquo;{ref.song}&rdquo;
                    </div>
                    <div className="mt-0.5 text-xs text-text-muted">
                      {ref.interval} ({ref.abbreviation})
                    </div>
                  </button>
                );
              })}
            </div>

            {!hasPlayed && (
              <p className="mt-2 text-center text-xs text-text-muted">
                Press Play to hear the interval first
              </p>
            )}

            {/* Feedback text */}
            {feedback === "correct" && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-xs font-medium text-green-400"
              >
                Correct! &ldquo;{round.correct.song}&rdquo; starts with a {round.correct.interval}.
              </motion.p>
            )}
            {feedback === "wrong" && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-xs font-medium text-red-400"
              >
                Not quite — that was a {round.correct.interval}, like &ldquo;{round.correct.song}&rdquo;.
              </motion.p>
            )}

            {/* Exercise explanation */}
            <AnimatePresence>
              {explanation && (
                <ExerciseExplanation
                  exerciseTitle="Interval Song References"
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
