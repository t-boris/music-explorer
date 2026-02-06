"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { ExerciseExplanation } from "@/components/exercises/exercise-explanation";

// ─── Types ───

interface FrequencyCalculatorProps {
  onComplete: () => void;
  completed: boolean;
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
}

interface NoteField {
  note: string;
  semitones: number;
  expected: number;
  value: string;
  status: "idle" | "correct" | "wrong";
  attempts: number;
}

// ─── Constants ───

const BASE_FREQ = 440; // A4

const INITIAL_FIELDS: NoteField[] = [
  { note: "C5", semitones: 3, expected: 523.25, value: "", status: "idle", attempts: 0 },
  { note: "D5", semitones: 5, expected: 587.33, value: "", status: "idle", attempts: 0 },
  { note: "E5", semitones: 7, expected: 659.26, value: "", status: "idle", attempts: 0 },
  { note: "A5", semitones: 12, expected: 880.00, value: "", status: "idle", attempts: 0 },
];

// ─── Component ───

export function FrequencyCalculator({ onComplete, completed, lessonTitle, levelTitle, levelOrder }: FrequencyCalculatorProps) {
  const [fields, setFields] = useState<NoteField[]>(INITIAL_FIELDS);
  const [done, setDone] = useState(completed);
  const completedRef = useRef(false);
  const [explanation, setExplanation] = useState<{
    question: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  } | null>(null);

  const handleChange = useCallback(
    (index: number, value: string) => {
      setFields((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], value, status: "idle" };
        return next;
      });
    },
    []
  );

  const handleBlur = useCallback(
    (index: number) => {
      setFields((prev) => {
        const next = [...prev];
        const field = next[index];
        const numVal = parseFloat(field.value);

        if (isNaN(numVal) || field.value.trim() === "") {
          next[index] = { ...field, status: "idle" };
          return next;
        }

        const correct = Math.abs(numVal - field.expected) <= 0.5;
        next[index] = {
          ...field,
          status: correct ? "correct" : "wrong",
          attempts: field.attempts + (correct ? 0 : 1),
        };

        if (!correct) {
          setExplanation({
            question: `Calculate frequency of ${field.note} using equal temperament (n = ${field.semitones})`,
            studentAnswer: `${field.value} Hz`,
            correctAnswer: `${field.expected.toFixed(2)} Hz`,
            isCorrect: false,
          });
        }

        // Check if all correct
        if (correct && next.every((f) => f.status === "correct") && !completedRef.current) {
          completedRef.current = true;
          setTimeout(() => {
            setDone(true);
            onComplete();
          }, 300);
        }

        return next;
      });
    },
    [onComplete]
  );

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-4">
      <h3 className="mb-3 text-sm font-semibold text-text-primary">
        Equal Temperament Calculation
      </h3>

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
              All frequencies correct!
            </p>
          </motion.div>
        ) : (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-3 rounded-lg bg-surface-700/50 px-3 py-2">
              <div className="font-mono text-xs text-text-secondary">
                f<sub>new</sub> = {BASE_FREQ} &times; 2<sup>(n/12)</sup>
              </div>
            </div>

            <p className="mb-3 text-xs text-text-muted">
              Calculate the frequency for each note using the equal temperament formula.
              Answers within &plusmn;0.5 Hz are accepted.
            </p>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.note} className="flex items-center gap-3">
                  <label className="w-32 text-xs text-text-secondary">
                    <span className="font-semibold text-text-primary">{field.note}</span>{" "}
                    (n = {field.semitones})
                  </label>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.01"
                      value={field.value}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onBlur={() => handleBlur(index)}
                      placeholder="Hz"
                      className={`w-full rounded-lg border bg-surface-700 px-3 py-1.5 font-mono text-sm text-text-primary outline-none placeholder:text-text-muted/40 ${
                        field.status === "correct"
                          ? "border-green-500"
                          : field.status === "wrong"
                            ? "border-red-500"
                            : "border-surface-600 focus:border-accent-400"
                      }`}
                    />
                    {field.status === "correct" && (
                      <Check className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-green-400" />
                    )}
                  </div>
                  {field.status === "wrong" && field.attempts > 0 && (
                    <span className="whitespace-nowrap text-xs text-red-400">
                      {BASE_FREQ} &times; 2^({field.semitones}/12) = {field.expected.toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <AnimatePresence>
              {explanation && (
                <ExerciseExplanation
                  exerciseTitle="Equal Temperament Calculation"
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
