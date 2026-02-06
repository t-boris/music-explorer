"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { ExerciseExplanation } from "@/components/exercises/exercise-explanation";

// ─── Types ───

interface RhythmMathProps {
  onComplete: () => void;
  completed: boolean;
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
}

interface Question {
  display: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

// ─── Question pool ───

const QUESTION_POOL: Question[] = [
  // fill-note: ♩ + ? = 𝅗𝅥
  {
    display: "♩ + ? = 𝅗𝅥",
    choices: ["♪", "♩", "𝅗𝅥", "♩."],
    correctIndex: 1,
    explanation: "A quarter note (1 beat) + a quarter note (1 beat) = a half note (2 beats)",
  },
  // fill-note: 𝅗𝅥 + ? = 𝅝
  {
    display: "𝅗𝅥 + ? = 𝅝",
    choices: ["♩", "♪", "𝅗𝅥", "♩."],
    correctIndex: 2,
    explanation: "A half note (2 beats) + a half note (2 beats) = a whole note (4 beats)",
  },
  // fill-note: ♪ + ? = ♩
  {
    display: "♪ + ? = ♩",
    choices: ["♪", "♩", "𝅗𝅥", "♩."],
    correctIndex: 0,
    explanation: "An eighth note (0.5 beats) + an eighth note (0.5 beats) = a quarter note (1 beat)",
  },
  // fill-beats: 𝅗𝅥 + ♩ = ? beats
  {
    display: "𝅗𝅥 + ♩ = ? beats",
    choices: ["2", "3", "4", "2.5"],
    correctIndex: 1,
    explanation: "A half note (2 beats) + a quarter note (1 beat) = 3 beats",
  },
  // fill-beats: ♩ + ♩ + ♩ = ? beats
  {
    display: "♩ + ♩ + ♩ = ? beats",
    choices: ["2", "3", "4", "3.5"],
    correctIndex: 1,
    explanation: "Three quarter notes: 1 + 1 + 1 = 3 beats",
  },
  // fill-beats: 𝅗𝅥 + 𝅗𝅥 = ? beats
  {
    display: "𝅗𝅥 + 𝅗𝅥 = ? beats",
    choices: ["2", "3", "4", "6"],
    correctIndex: 2,
    explanation: "Two half notes: 2 + 2 = 4 beats (same as a whole note)",
  },
  // fill-beats: ♩. + ♪ = ? beats
  {
    display: "♩. + ♪ = ? beats",
    choices: ["1.5", "2", "2.5", "3"],
    correctIndex: 1,
    explanation: "A dotted quarter (1.5 beats) + an eighth note (0.5 beats) = 2 beats",
  },
  // equivalence: ♩. = ♩ + ?
  {
    display: "♩. = ♩ + ?",
    choices: ["♩", "♪", "𝅗𝅥", "♩."],
    correctIndex: 1,
    explanation: "A dotted quarter (1.5 beats) = a quarter (1 beat) + an eighth (0.5 beats). The dot adds half the note's value.",
  },
  // equivalence: 𝅗𝅥. = 𝅗𝅥 + ?
  {
    display: "𝅗𝅥. = 𝅗𝅥 + ?",
    choices: ["♪", "♩", "𝅗𝅥", "♩."],
    correctIndex: 1,
    explanation: "A dotted half (3 beats) = a half (2 beats) + a quarter (1 beat). The dot adds half the note's value.",
  },
  // comparison
  {
    display: "Which is longer: ♩. or 𝅗𝅥?",
    choices: ["♩. (1.5 beats)", "𝅗𝅥 (2 beats)", "They're equal", "Depends on tempo"],
    correctIndex: 1,
    explanation: "A dotted quarter is 1.5 beats, while a half note is 2 beats. The half note is longer.",
  },
  // comparison
  {
    display: "Which is longer: 𝅗𝅥. or 𝅝?",
    choices: ["𝅗𝅥. (3 beats)", "𝅝 (4 beats)", "They're equal", "Depends on tempo"],
    correctIndex: 1,
    explanation: "A dotted half is 3 beats, while a whole note is 4 beats. The whole note is longer.",
  },
  // fill-beats: 𝅝 = ? × ♩
  {
    display: "𝅝 = ? × ♩",
    choices: ["2", "3", "4", "8"],
    correctIndex: 2,
    explanation: "A whole note (4 beats) equals 4 quarter notes (4 × 1 beat)",
  },
  // fill-beats: ♩ = ? × ♪
  {
    display: "♩ = ? × ♪",
    choices: ["1", "2", "4", "0.5"],
    correctIndex: 1,
    explanation: "A quarter note (1 beat) equals 2 eighth notes (2 × 0.5 beats)",
  },
  // fill-note: ♩ + ♩ + ? = 𝅝
  {
    display: "♩ + ♩ + ? = 𝅝",
    choices: ["♪", "♩", "𝅗𝅥", "♩."],
    correctIndex: 2,
    explanation: "Quarter (1) + quarter (1) + half (2) = 4 beats = whole note",
  },
  // equivalence: 𝅗𝅥 = ? × ♪
  {
    display: "𝅗𝅥 = ? × ♪",
    choices: ["2", "3", "4", "8"],
    correctIndex: 2,
    explanation: "A half note (2 beats) equals 4 eighth notes (4 × 0.5 beats)",
  },
  // comparison
  {
    display: "Which is shorter: ♩ or ♪?",
    choices: ["♩ (1 beat)", "♪ (0.5 beats)", "They're equal", "Depends on tempo"],
    correctIndex: 1,
    explanation: "An eighth note (0.5 beats) is shorter than a quarter note (1 beat).",
  },
  // fill-beats
  {
    display: "♪ + ♪ + ♩ = ? beats",
    choices: ["1", "1.5", "2", "2.5"],
    correctIndex: 2,
    explanation: "Two eighths (0.5 + 0.5 = 1) + one quarter (1) = 2 beats",
  },
  // equivalence
  {
    display: "𝅝 - ♩ = ?",
    choices: ["♩", "𝅗𝅥", "𝅗𝅥.", "♩."],
    correctIndex: 2,
    explanation: "A whole note (4 beats) minus a quarter (1 beat) = 3 beats = dotted half note",
  },
];

function pickQuestion(usedIndices: Set<number>): { question: Question; index: number } {
  const available = QUESTION_POOL.map((_, i) => i).filter((i) => !usedIndices.has(i));
  const pool = available.length > 0 ? available : QUESTION_POOL.map((_, i) => i);
  const idx = pool[Math.floor(Math.random() * pool.length)];
  return { question: QUESTION_POOL[idx], index: idx };
}

// ─── Component ───

export function RhythmMath({
  onComplete,
  completed,
  lessonTitle,
  levelTitle,
  levelOrder,
}: RhythmMathProps) {
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());
  const [current, setCurrent] = useState(() => pickQuestion(new Set()));
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [streak, setStreak] = useState(0);
  const [done, setDone] = useState(completed);
  const completedRef = useRef(false);
  const [explanation, setExplanation] = useState<{
    question: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  } | null>(null);

  const nextRound = useCallback(() => {
    const newUsed = new Set(usedIndices);
    newUsed.add(current.index);
    setUsedIndices(newUsed);
    const next = pickQuestion(newUsed);
    setCurrent(next);
    setSelectedIdx(null);
    setFeedback(null);
  }, [usedIndices, current.index]);

  const handleSelect = useCallback(
    (idx: number) => {
      if (feedback !== null) return;

      setSelectedIdx(idx);
      const isCorrect = idx === current.question.correctIndex;
      setFeedback(isCorrect ? "correct" : "wrong");

      const q = current.question;
      const studentAnswer = q.choices[idx];
      const correctAnswer = q.choices[q.correctIndex];

      if (isCorrect) {
        const newStreak = streak + 1;
        setStreak(newStreak);

        setExplanation({
          question: q.display,
          studentAnswer,
          correctAnswer,
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
          question: q.display,
          studentAnswer,
          correctAnswer,
          isCorrect: false,
        });
      }
    },
    [feedback, current, streak, onComplete, nextRound]
  );

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-4">
      <h3 className="mb-1 text-sm font-semibold text-text-primary">
        Rhythm Math
      </h3>
      <p className="mb-3 text-xs text-text-muted">
        Solve note value equations. Get 3 in a row to complete.
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
              Rhythm math complete!
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

            {/* Question display */}
            <div className="mb-4 rounded-lg bg-surface-700/30 px-4 py-4">
              <p className="text-center font-serif text-xl text-text-primary">
                {current.question.display}
              </p>
            </div>

            {/* Choice buttons */}
            <div className="mb-3 grid grid-cols-2 gap-2">
              {current.question.choices.map((choice, idx) => {
                const isSelected = selectedIdx === idx;
                const isCorrectAnswer = idx === current.question.correctIndex;

                let btnStyle =
                  "border-surface-600 text-text-primary hover:border-accent-400 hover:bg-surface-700";
                if (feedback !== null && isSelected && feedback === "correct") {
                  btnStyle = "border-green-500 bg-green-500/15 text-green-400";
                } else if (feedback !== null && isSelected && feedback === "wrong") {
                  btnStyle = "border-red-500 bg-red-500/15 text-red-400";
                } else if (feedback === "wrong" && isCorrectAnswer) {
                  btnStyle = "border-green-500/50 bg-green-500/5 text-green-400/70";
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(idx)}
                    disabled={feedback !== null}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-default ${btnStyle}`}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {feedback === "correct" && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-xs font-medium text-green-400"
              >
                Correct! {current.question.explanation}
              </motion.p>
            )}
            {feedback === "wrong" && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                <p className="mt-2 text-xs font-medium text-red-400">
                  Not quite — {current.question.explanation}
                </p>
                <button
                  type="button"
                  onClick={nextRound}
                  className="mt-2 rounded-lg bg-surface-700 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-600"
                >
                  Next Question
                </button>
              </motion.div>
            )}

            {/* Exercise explanation */}
            <AnimatePresence>
              {explanation && (
                <ExerciseExplanation
                  exerciseTitle="Rhythm Math"
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
