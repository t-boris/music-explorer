"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";

// ─── Types ───

interface OvertoneCalculatorProps {
  onComplete: () => void;
  completed: boolean;
}

interface HarmonicField {
  harmonicNumber: number;
  expected: number;
  value: string;
  status: "idle" | "correct" | "wrong";
}

// ─── Constants ───

const FUNDAMENTAL = 110; // A2

const INITIAL_FIELDS: HarmonicField[] = [
  { harmonicNumber: 2, expected: 220, value: "", status: "idle" },
  { harmonicNumber: 3, expected: 330, value: "", status: "idle" },
  { harmonicNumber: 4, expected: 440, value: "", status: "idle" },
  { harmonicNumber: 5, expected: 550, value: "", status: "idle" },
];

// ─── Component ───

export function OvertoneCalculator({ onComplete, completed }: OvertoneCalculatorProps) {
  const [fields, setFields] = useState<HarmonicField[]>(INITIAL_FIELDS);
  const [done, setDone] = useState(completed);
  const completedRef = useRef(false);

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

        const correct = numVal === field.expected;
        next[index] = { ...field, status: correct ? "correct" : "wrong" };

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
        Harmonic Series Calculation
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
              All harmonics correct!
            </p>
          </motion.div>
        ) : (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="mb-3 text-xs text-text-muted">
              Given fundamental = <span className="font-mono text-accent-400">{FUNDAMENTAL} Hz</span> (A2),
              enter the frequency for each harmonic.
            </p>

            <div className="mb-2 rounded-lg bg-surface-700/50 px-3 py-2">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <span className="font-mono">f<sub>n</sub> = n &times; f<sub>1</sub></span>
                <span className="text-text-muted">where f<sub>1</sub> = {FUNDAMENTAL} Hz</span>
              </div>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.harmonicNumber} className="flex items-center gap-3">
                  <label className="w-32 text-xs text-text-secondary">
                    {field.harmonicNumber === 2
                      ? "2nd"
                      : field.harmonicNumber === 3
                        ? "3rd"
                        : `${field.harmonicNumber}th`}{" "}
                    harmonic ({field.harmonicNumber} &times; {FUNDAMENTAL})
                  </label>
                  <div className="relative flex-1">
                    <input
                      type="number"
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
                  {field.status === "wrong" && (
                    <span className="text-xs text-red-400">
                      Multiply {FUNDAMENTAL} &times; {field.harmonicNumber}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
