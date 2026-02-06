"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { ExerciseExplanation } from "@/components/exercises/exercise-explanation";

// ─── Types ───

interface OctaveMatcherProps {
  onComplete: () => void;
  completed: boolean;
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
}

// ─── Constants ───

// Starting note: A on 5th fret of low E string = 110 Hz
const START_STRING = 5; // Low E (string index 5 from top, 0-based: high E=0)
const START_FRET = 5;
const START_FREQ = 110;
const OCTAVE_FREQ = 220;

// Correct octave positions (string index 0=high E, 5=low E)
// Using standard tuning MIDI: E2=40, A2=45, D3=50, G3=55, B3=59, E4=64
// A3 (220 Hz) = MIDI 57
// String 4 (A string, idx 4): fret 12 → MIDI 45+12 = 57 ✓
// String 3 (D string, idx 3): fret 7 → MIDI 50+7 = 57 ✓
// String 2 (G string, idx 2): fret 2 → MIDI 55+2 = 57 ✓
const CORRECT_POSITIONS = [
  { string: 4, fret: 12 },
  { string: 3, fret: 7 },
  { string: 2, fret: 2 },
];

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

const STRING_LABELS = ["E", "B", "G", "D", "A", "E"];
const SINGLE_DOTS = [3, 5, 7, 9];
const DOUBLE_DOTS = [12];

// Standard tuning MIDI
const STANDARD_TUNING_MIDI = [64, 59, 55, 50, 45, 40]; // E4, B3, G3, D3, A2, E2 (top to bottom)

function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// ─── Component ───

export function OctaveMatcher({ onComplete, completed, lessonTitle, levelTitle, levelOrder }: OctaveMatcherProps) {
  const [done, setDone] = useState(completed);
  const [lastTap, setLastTap] = useState<{ string: number; fret: number; correct: boolean } | null>(null);
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
    (frequency: number, delay: number = 0) => {
      const ctx = getAudioContext();
      const now = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = frequency;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
      gain.gain.setValueAtTime(0.3, now + 0.35);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    },
    [getAudioContext]
  );

  const handleFretTap = useCallback(
    (stringIdx: number, fret: number) => {
      if (done) return;

      const midi = STANDARD_TUNING_MIDI[stringIdx] + fret;
      const freq = midiToFrequency(midi);
      const isCorrect = CORRECT_POSITIONS.some(
        (p) => p.string === stringIdx && p.fret === fret
      );

      // Play the tapped note
      playTone(freq);

      const stringLabel = STRING_LABELS[stringIdx];

      if (isCorrect) {
        // Play both notes in sequence for comparison
        playTone(START_FREQ, 0.5);
        setLastTap({ string: stringIdx, fret, correct: true });

        setExplanation({
          question: `Find the octave of A (${START_FREQ} Hz) on the fretboard`,
          studentAnswer: `String ${stringLabel}, Fret ${fret} (${Math.round(freq)} Hz)`,
          correctAnswer: `String ${stringLabel}, Fret ${fret} — ${OCTAVE_FREQ} Hz (double the original frequency)`,
          isCorrect: true,
        });

        if (!completedRef.current) {
          completedRef.current = true;
          setTimeout(() => {
            setDone(true);
            onComplete();
          }, 1000);
        }
      } else {
        setLastTap({ string: stringIdx, fret, correct: false });
        setExplanation({
          question: `Find the octave of A (${START_FREQ} Hz) on the fretboard`,
          studentAnswer: `String ${stringLabel}, Fret ${fret} (${Math.round(freq)} Hz)`,
          correctAnswer: "String A fret 12, String D fret 7, or String G fret 2 (all produce 220 Hz)",
          isCorrect: false,
        });
        setTimeout(() => setLastTap(null), 600);
      }
    },
    [done, playTone, onComplete]
  );

  // ─── SVG Layout Helpers ───

  const fretX = (fret: number) => PAD_LEFT + NUT_WIDTH + fret * FRET_WIDTH;
  const stringY = (s: number) => PAD_TOP + s * STRING_SPACING;
  const noteX = (fret: number) =>
    fret === 0 ? PAD_LEFT + NUT_WIDTH / 2 - 10 : fretX(fret) - FRET_WIDTH / 2;

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-4">
      <h3 className="mb-3 text-sm font-semibold text-text-primary">
        Match the Octave
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
              Octave matched!
            </p>
          </motion.div>
        ) : (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="mb-2 text-xs text-text-muted">
              Find the same note (A) one octave up. The starting note
              (A at 5th fret, low E string = {START_FREQ} Hz) is highlighted in gold.
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
                  const thickness = 1 + (NUM_STRINGS - 1 - sIdx) * 0.25;
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

                {/* Starting note highlight (A on 5th fret low E) */}
                <circle
                  cx={noteX(START_FRET)}
                  cy={stringY(START_STRING)}
                  r={8}
                  fill="oklch(75% 0.15 65)"
                />
                <text
                  x={noteX(START_FRET)}
                  y={stringY(START_STRING) + 3}
                  textAnchor="middle"
                  fill="oklch(15% 0.01 250)"
                  fontSize={8}
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  A
                </text>

                {/* Tap targets for all positions (excluding start) */}
                {Array.from({ length: NUM_STRINGS }, (_, sIdx) =>
                  Array.from({ length: NUM_FRETS + 1 }, (_, fret) => {
                    if (sIdx === START_STRING && fret === START_FRET) return null;
                    if (fret === 0) return null;

                    const isCorrectTap = lastTap?.string === sIdx && lastTap?.fret === fret && lastTap.correct;
                    const isWrongTap = lastTap?.string === sIdx && lastTap?.fret === fret && !lastTap.correct;
                    const cx = noteX(fret);
                    const cy = stringY(sIdx);

                    return (
                      <g
                        key={`tap-${sIdx}-${fret}`}
                        onClick={() => handleFretTap(sIdx, fret)}
                        style={{ cursor: "pointer" }}
                      >
                        <rect
                          x={cx - FRET_WIDTH / 2 + 2}
                          y={cy - STRING_SPACING / 2}
                          width={FRET_WIDTH - 4}
                          height={STRING_SPACING}
                          fill="transparent"
                        />
                        {isCorrectTap && (
                          <circle cx={cx} cy={cy} r={8} fill="oklch(65% 0.2 150)" opacity={0.9} />
                        )}
                        {isWrongTap && (
                          <circle cx={cx} cy={cy} r={8} fill="oklch(60% 0.2 25)" opacity={0.7} />
                        )}
                        {isCorrectTap && (
                          <text
                            x={cx}
                            y={cy + 3}
                            textAnchor="middle"
                            fill="oklch(95% 0.01 250)"
                            fontSize={8}
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            A
                          </text>
                        )}
                      </g>
                    );
                  })
                )}
              </svg>
            </div>

            <div className="mt-2 flex items-center gap-3 text-xs text-text-muted">
              <button
                type="button"
                onClick={() => playTone(START_FREQ)}
                className="rounded bg-surface-700 px-2 py-1 text-text-secondary transition-colors hover:bg-surface-600"
              >
                Hear starting note (A = {START_FREQ} Hz)
              </button>
            </div>

            <AnimatePresence>
              {explanation && (
                <ExerciseExplanation
                  exerciseTitle="Match the Octave"
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
