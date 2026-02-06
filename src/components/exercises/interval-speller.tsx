"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, RotateCcw } from "lucide-react";
import { ExerciseExplanation } from "@/components/exercises/exercise-explanation";

// ─── Types ───

interface IntervalSpellerProps {
  onComplete: () => void;
  completed: boolean;
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
}

// ─── Note and interval data ───

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Enharmonic display: show flats for some intervals
const NOTE_DISPLAY: Record<string, string> = {
  "C": "C", "C#": "C#/Db", "D": "D", "D#": "D#/Eb", "E": "E", "F": "F",
  "F#": "F#/Gb", "G": "G", "G#": "G#/Ab", "A": "A", "A#": "A#/Bb", "B": "B",
};

interface IntervalDef {
  name: string;
  abbreviation: string;
  semitones: number;
}

const INTERVALS: IntervalDef[] = [
  { name: "Minor Second", abbreviation: "m2", semitones: 1 },
  { name: "Major Second", abbreviation: "M2", semitones: 2 },
  { name: "Minor Third", abbreviation: "m3", semitones: 3 },
  { name: "Major Third", abbreviation: "M3", semitones: 4 },
  { name: "Perfect Fourth", abbreviation: "P4", semitones: 5 },
  { name: "Tritone", abbreviation: "TT", semitones: 6 },
  { name: "Perfect Fifth", abbreviation: "P5", semitones: 7 },
  { name: "Minor Sixth", abbreviation: "m6", semitones: 8 },
  { name: "Major Sixth", abbreviation: "M6", semitones: 9 },
  { name: "Minor Seventh", abbreviation: "m7", semitones: 10 },
  { name: "Major Seventh", abbreviation: "M7", semitones: 11 },
  { name: "Perfect Octave", abbreviation: "P8", semitones: 12 },
];

// ─── Round generation ───

interface Round {
  rootNote: string;
  interval: IntervalDef;
  correctNote: string;
}

function generateRound(previousKey: string | null): Round {
  // Pick a random root note
  const rootNote = NOTE_NAMES[Math.floor(Math.random() * NOTE_NAMES.length)];
  // Pick a random interval
  const interval = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];
  // Calculate target note
  const rootIdx = NOTE_NAMES.indexOf(rootNote);
  const targetIdx = (rootIdx + interval.semitones) % 12;
  const correctNote = NOTE_NAMES[targetIdx];

  const key = `${rootNote}-${interval.semitones}`;
  if (key === previousKey) {
    return generateRound(previousKey); // avoid repeat
  }

  return { rootNote, interval, correctNote };
}

// ─── Component ───

export function IntervalSpeller({
  onComplete,
  completed,
  lessonTitle,
  levelTitle,
  levelOrder,
}: IntervalSpellerProps) {
  const [round, setRound] = useState<Round>(() => generateRound(null));
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [done, setDone] = useState(completed);
  const completedRef = useRef(false);
  const [explanation, setExplanation] = useState<{
    question: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  } | null>(null);

  const nextRound = useCallback(() => {
    const key = `${round.rootNote}-${round.interval.semitones}`;
    setRound(generateRound(key));
    setFeedback(null);
    setSelectedNote(null);
  }, [round]);

  const handleSelect = useCallback(
    (note: string) => {
      if (feedback !== null) return;

      setSelectedNote(note);
      const isCorrect = note === round.correctNote;
      setFeedback(isCorrect ? "correct" : "wrong");

      const question = `${round.rootNote} + ${round.interval.name} (${round.interval.abbreviation}) = ?`;

      if (isCorrect) {
        const newStreak = streak + 1;
        setStreak(newStreak);

        setExplanation({
          question,
          studentAnswer: NOTE_DISPLAY[note],
          correctAnswer: `${NOTE_DISPLAY[round.correctNote]} (${round.rootNote} + ${round.interval.semitones} semitones)`,
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
          question,
          studentAnswer: `${NOTE_DISPLAY[note]} (${NOTE_NAMES.indexOf(note) - NOTE_NAMES.indexOf(round.rootNote)} semitones from ${round.rootNote})`,
          correctAnswer: `${NOTE_DISPLAY[round.correctNote]} (${round.rootNote} + ${round.interval.semitones} semitones = ${NOTE_DISPLAY[round.correctNote]})`,
          isCorrect: false,
        });
      }
    },
    [feedback, round, streak, onComplete, nextRound]
  );

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-4">
      <h3 className="mb-1 text-sm font-semibold text-text-primary">
        Interval Spelling
      </h3>
      <p className="mb-3 text-xs text-text-muted">
        Given a root note and interval, find the target note. Get 3 in a row to complete.
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
              Interval spelling complete!
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

            {/* Problem display */}
            <div className="mb-4 rounded-lg bg-surface-700/50 px-4 py-4 text-center">
              <div className="flex items-center justify-center gap-3">
                <span className="rounded-lg bg-accent-500/20 px-3 py-1.5 font-mono text-lg font-bold text-accent-400">
                  {round.rootNote}
                </span>
                <span className="text-lg text-text-muted">+</span>
                <span className="text-sm font-medium text-text-primary">
                  {round.interval.name}
                </span>
                <span className="text-xs text-text-muted">
                  ({round.interval.abbreviation}, {round.interval.semitones}st)
                </span>
                <span className="text-lg text-text-muted">=</span>
                <span className="rounded-lg border-2 border-dashed border-surface-500 px-3 py-1.5 font-mono text-lg font-bold text-text-muted">
                  {selectedNote ? NOTE_DISPLAY[selectedNote] : "?"}
                </span>
              </div>
            </div>

            {/* Chromatic note buttons */}
            <div className="mb-3 flex flex-wrap justify-center gap-1.5">
              {NOTE_NAMES.map((note) => {
                const isSelected = selectedNote === note;
                const isCorrectNote = note === round.correctNote;
                const borderColor =
                  isSelected && feedback === "correct"
                    ? "border-green-500 bg-green-500/15 text-green-400"
                    : isSelected && feedback === "wrong"
                      ? "border-red-500 bg-red-500/15 text-red-400"
                      : feedback !== null && isCorrectNote
                        ? "border-green-500/50 bg-green-500/5 text-green-400/70"
                        : "border-surface-600 text-text-primary hover:border-accent-400 hover:bg-surface-700";

                return (
                  <button
                    key={note}
                    type="button"
                    onClick={() => handleSelect(note)}
                    disabled={feedback !== null}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${borderColor}`}
                  >
                    {NOTE_DISPLAY[note]}
                  </button>
                );
              })}
            </div>

            {/* Hint: show root position on chromatic scale */}
            {feedback === null && (
              <p className="mb-2 text-center text-xs text-text-muted">
                Count {round.interval.semitones} semitone{round.interval.semitones !== 1 ? "s" : ""} up from {round.rootNote}
              </p>
            )}

            {feedback === "wrong" && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={nextRound}
                  className="flex items-center gap-1.5 rounded-lg bg-surface-700 px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-600"
                >
                  <RotateCcw className="h-3 w-3" />
                  Next
                </button>
              </div>
            )}

            {/* Feedback text */}
            {feedback === "correct" && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-center text-xs font-medium text-green-400"
              >
                Correct! {round.rootNote} + {round.interval.semitones} semitones = {NOTE_DISPLAY[round.correctNote]}.
              </motion.p>
            )}
            {feedback === "wrong" && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-center text-xs font-medium text-red-400"
              >
                Not quite — {round.rootNote} + {round.interval.semitones} semitones = {NOTE_DISPLAY[round.correctNote]}.
              </motion.p>
            )}

            {/* Exercise explanation */}
            <AnimatePresence>
              {explanation && (
                <ExerciseExplanation
                  exerciseTitle="Interval Spelling"
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
