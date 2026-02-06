"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { ExerciseExplanation } from "@/components/exercises/exercise-explanation";

// ─── Types ───

interface HarmonicFinderProps {
  onComplete: () => void;
  completed: boolean;
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
}

interface FretResult {
  fret: number;
  correct: boolean;
}

// ─── Constants ───

const HIGH_E_FUNDAMENTAL = 329.63;
const HARMONIC_FRETS: Record<number, { multiplier: number; label: string }> = {
  12: { multiplier: 2, label: "2nd harmonic (octave)" },
  7: { multiplier: 3, label: "3rd harmonic" },
  5: { multiplier: 4, label: "4th harmonic" },
};
const TARGET_FRETS = [12, 7, 5];
const NUM_FRETS = 12;
const NUM_STRINGS = 6;

// SVG Layout
const STRING_SPACING = 22;
const FRET_WIDTH = 42;
const NUT_WIDTH = 5;
const PAD_LEFT = 28;
const PAD_TOP = 18;
const PAD_BOTTOM = 22;
const TOTAL_WIDTH = PAD_LEFT + NUT_WIDTH + NUM_FRETS * FRET_WIDTH + 12;
const TOTAL_HEIGHT = PAD_TOP + (NUM_STRINGS - 1) * STRING_SPACING + PAD_BOTTOM;

const STRING_LABELS = ["E", "A", "D", "G", "B", "E"];
const SINGLE_DOTS = [3, 5, 7, 9];
const DOUBLE_DOTS = [12];

// ─── Component ───

export function HarmonicFinder({ onComplete, completed, lessonTitle, levelTitle, levelOrder }: HarmonicFinderProps) {
  const [found, setFound] = useState<Set<number>>(new Set());
  const [lastTap, setLastTap] = useState<FretResult | null>(null);
  const [done, setDone] = useState(completed);
  const completedRef = useRef(false);
  const [explanation, setExplanation] = useState<{
    question: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  } | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback(
    (frequency: number) => {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = frequency;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.01);
      gain.gain.setValueAtTime(0.25, now + 0.5);
      gain.gain.linearRampToValueAtTime(0, now + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    },
    [getAudioContext]
  );

  const handleFretTap = useCallback(
    (fret: number) => {
      if (done) return;
      const harmonic = HARMONIC_FRETS[fret];

      if (harmonic && !found.has(fret)) {
        // Correct
        playTone(HIGH_E_FUNDAMENTAL * harmonic.multiplier);
        const newFound = new Set(found);
        newFound.add(fret);
        setFound(newFound);
        setLastTap({ fret, correct: true });

        setExplanation({
          question: "Which fret produces a natural harmonic on the high E string?",
          studentAnswer: `Fret ${fret} (${harmonic.label})`,
          correctAnswer: `Fret ${fret} — ${harmonic.label} at ${Math.round(HIGH_E_FUNDAMENTAL * harmonic.multiplier)} Hz`,
          isCorrect: true,
        });

        if (
          TARGET_FRETS.every((f) => newFound.has(f)) &&
          !completedRef.current
        ) {
          completedRef.current = true;
          setTimeout(() => {
            setDone(true);
            onComplete();
          }, 600);
        }
      } else if (!harmonic) {
        // Wrong
        setLastTap({ fret, correct: false });
        setExplanation({
          question: "Which fret produces a natural harmonic on the high E string?",
          studentAnswer: `Fret ${fret}`,
          correctAnswer: "Frets 12, 7, and 5 produce natural harmonics",
          isCorrect: false,
        });
      }

      setTimeout(() => setLastTap(null), 800);
    },
    [found, done, playTone, onComplete]
  );

  // ─── SVG Layout Helpers ───

  const fretX = (fret: number) => PAD_LEFT + NUT_WIDTH + fret * FRET_WIDTH;
  const stringY = (s: number) => PAD_TOP + s * STRING_SPACING;
  const noteX = (fret: number) =>
    fret === 0 ? PAD_LEFT + NUT_WIDTH / 2 - 10 : fretX(fret) - FRET_WIDTH / 2;

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">
          Find Natural Harmonics
        </h3>
        <span className="text-xs text-text-muted">
          Found: {found.size}/3
        </span>
      </div>

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
              All harmonics found!
            </p>
          </motion.div>
        ) : (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="mb-2 text-xs text-text-muted">
              Tap the fret positions on the high E string where natural harmonics occur (frets 12, 7, 5).
            </p>

            <div className="overflow-x-auto rounded-lg">
              <svg
                width={TOTAL_WIDTH}
                height={TOTAL_HEIGHT}
                viewBox={`0 0 ${TOTAL_WIDTH} ${TOTAL_HEIGHT}`}
                className="min-w-fit"
              >
                {/* Background */}
                <rect
                  x={PAD_LEFT}
                  y={PAD_TOP - 6}
                  width={TOTAL_WIDTH - PAD_LEFT - 12}
                  height={(NUM_STRINGS - 1) * STRING_SPACING + 12}
                  rx={3}
                  fill="oklch(25% 0.015 250)"
                />

                {/* Nut */}
                <rect
                  x={PAD_LEFT}
                  y={PAD_TOP - 4}
                  width={NUT_WIDTH}
                  height={(NUM_STRINGS - 1) * STRING_SPACING + 8}
                  rx={2}
                  fill="oklch(60% 0.02 250)"
                />

                {/* Fret wires */}
                {Array.from({ length: NUM_FRETS }, (_, i) => i + 1).map((fret) => (
                  <line
                    key={`fw-${fret}`}
                    x1={fretX(fret)}
                    y1={PAD_TOP - 4}
                    x2={fretX(fret)}
                    y2={PAD_TOP + (NUM_STRINGS - 1) * STRING_SPACING + 4}
                    stroke="oklch(40% 0.02 250)"
                    strokeWidth={1.5}
                  />
                ))}

                {/* Fret dots */}
                {Array.from({ length: NUM_FRETS }, (_, i) => i + 1).map((fret) => {
                  const midY = PAD_TOP + ((NUM_STRINGS - 1) * STRING_SPACING) / 2;
                  if (SINGLE_DOTS.includes(fret)) {
                    return (
                      <circle
                        key={`dot-${fret}`}
                        cx={noteX(fret)}
                        cy={midY}
                        r={2.5}
                        fill="oklch(40% 0.02 250)"
                      />
                    );
                  }
                  if (DOUBLE_DOTS.includes(fret)) {
                    return (
                      <g key={`dot-${fret}`}>
                        <circle cx={noteX(fret)} cy={midY - 12} r={2.5} fill="oklch(40% 0.02 250)" />
                        <circle cx={noteX(fret)} cy={midY + 12} r={2.5} fill="oklch(40% 0.02 250)" />
                      </g>
                    );
                  }
                  return null;
                })}

                {/* Strings */}
                {STRING_LABELS.map((_, sIdx) => {
                  const thickness = 1 + sIdx * 0.25;
                  return (
                    <line
                      key={`str-${sIdx}`}
                      x1={PAD_LEFT + NUT_WIDTH}
                      y1={stringY(sIdx)}
                      x2={fretX(NUM_FRETS)}
                      y2={stringY(sIdx)}
                      stroke="oklch(55% 0.02 250)"
                      strokeWidth={thickness}
                    />
                  );
                })}

                {/* String labels */}
                {STRING_LABELS.map((name, sIdx) => (
                  <text
                    key={`sl-${sIdx}`}
                    x={PAD_LEFT - 6}
                    y={stringY(sIdx) + 3}
                    textAnchor="end"
                    fill="oklch(50% 0.02 250)"
                    fontSize={9}
                    fontFamily="monospace"
                  >
                    {name}
                  </text>
                ))}

                {/* Fret numbers */}
                {Array.from({ length: NUM_FRETS }, (_, i) => i + 1).map((fret) => (
                  <text
                    key={`fn-${fret}`}
                    x={noteX(fret)}
                    y={PAD_TOP + (NUM_STRINGS - 1) * STRING_SPACING + 16}
                    textAnchor="middle"
                    fill="oklch(40% 0.02 250)"
                    fontSize={8}
                    fontFamily="monospace"
                  >
                    {fret}
                  </text>
                ))}

                {/* Tap targets on high E string (string index 0 from top = high E) */}
                {Array.from({ length: NUM_FRETS }, (_, i) => i + 1).map((fret) => {
                  const isFound = found.has(fret);
                  const isWrongTap = lastTap?.fret === fret && !lastTap.correct;
                  const cx = noteX(fret);
                  const cy = stringY(0); // high E is first string (top)

                  return (
                    <g
                      key={`tap-${fret}`}
                      onClick={() => handleFretTap(fret)}
                      style={{ cursor: "pointer" }}
                    >
                      {/* Invisible tap area */}
                      <rect
                        x={cx - FRET_WIDTH / 2 + 2}
                        y={cy - STRING_SPACING / 2}
                        width={FRET_WIDTH - 4}
                        height={STRING_SPACING}
                        fill="transparent"
                      />
                      {isFound && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={8}
                          fill="oklch(65% 0.2 150)"
                          opacity={0.9}
                        />
                      )}
                      {isWrongTap && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={8}
                          fill="oklch(60% 0.2 25)"
                          opacity={0.7}
                        />
                      )}
                      {isFound && (
                        <text
                          x={cx}
                          y={cy + 3}
                          textAnchor="middle"
                          fill="oklch(95% 0.01 250)"
                          fontSize={8}
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {fret}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Found harmonics info */}
            {found.size > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {Array.from(found)
                  .sort((a, b) => a - b)
                  .map((fret) => (
                    <span
                      key={fret}
                      className="rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs text-green-400"
                    >
                      Fret {fret}: {HARMONIC_FRETS[fret].label} ({Math.round(HIGH_E_FUNDAMENTAL * HARMONIC_FRETS[fret].multiplier)} Hz)
                    </span>
                  ))}
              </div>
            )}

            <AnimatePresence>
              {explanation && (
                <ExerciseExplanation
                  exerciseTitle="Find Natural Harmonics"
                  exerciseType="fretboard"
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
