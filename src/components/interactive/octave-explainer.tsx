"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ─── Constants (shared with OctaveMatcher) ───

const NUM_FRETS = 12;
const NUM_STRINGS = 6;

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

// Standard tuning MIDI (top to bottom: high E, B, G, D, A, low E)
const STANDARD_TUNING_MIDI = [64, 59, 55, 50, 45, 40];

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function midiToNoteName(midi: number): string {
  return NOTE_NAMES[midi % 12];
}

// Root note: A on 5th fret of low E string
const ROOT = { string: 5, fret: 5, freq: 110, label: "A" };

// ─── Steps ───

interface OctavePosition {
  string: number;
  fret: number;
  freq: number;
  label: string;
}

interface Step {
  positions: OctavePosition[];
  rule: string;
  description: string;
}

const STEPS: Step[] = [
  {
    positions: [],
    rule: "",
    description:
      "This is A at 110 Hz on the 5th fret of the low E string.",
  },
  {
    positions: [{ string: 4, fret: 12, freq: 220, label: "A" }],
    rule: "12 frets = 1 octave",
    description:
      "The open A string is A2 (110 Hz). Its 12th fret doubles the frequency to A3 (220 Hz).",
  },
  {
    positions: [{ string: 3, fret: 7, freq: 220, label: "A" }],
    rule: "Skip one string, add 2 frets",
    description:
      "From fret 5 on the low E string, skip one string to D and go 2 frets higher \u2192 fret 7 = A3 (220 Hz).",
  },
  {
    positions: [{ string: 2, fret: 2, freq: 220, label: "A" }],
    rule: "Skip two strings, go 3 frets back",
    description:
      "From fret 5 on the low E string, skip two strings to G and go 3 frets back \u2192 fret 2 = A3 (220 Hz).",
  },
  {
    positions: [],
    rule: "Multiple paths to every octave",
    description:
      "All three positions produce the same note. Guitar gives you multiple paths to each octave!",
  },
];

// All octave positions (accumulated across steps 1-3)
const ALL_OCTAVE_POSITIONS: OctavePosition[] = [
  { string: 4, fret: 12, freq: 220, label: "A" },
  { string: 3, fret: 7, freq: 220, label: "A" },
  { string: 2, fret: 2, freq: 220, label: "A" },
];

// ─── Component ───

export function OctaveExplainer() {
  const [step, setStep] = useState(0);
  const [tapped, setTapped] = useState<{ string: number; fret: number } | null>(null);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      const midi = STANDARD_TUNING_MIDI[stringIdx] + fret;
      const freq = midiToFrequency(midi);
      playTone(freq);
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      setTapped({ string: stringIdx, fret });
      tapTimerRef.current = setTimeout(() => setTapped(null), 1500);
    },
    [playTone]
  );

  // Determine which octave positions are visible at the current step
  const visiblePositions: OctavePosition[] = [];
  if (step >= 1) visiblePositions.push(ALL_OCTAVE_POSITIONS[0]);
  if (step >= 2) visiblePositions.push(ALL_OCTAVE_POSITIONS[1]);
  if (step >= 3) visiblePositions.push(ALL_OCTAVE_POSITIONS[2]);
  // Step 4 shows all three (same as step 3)
  if (step === 4) {
    // Already has all three from step >= 3
  }

  // The "new" position for this step (gets the pulse animation)
  const newPosition = step >= 1 && step <= 3 ? STEPS[step].positions[0] : null;

  // ─── SVG Layout Helpers ───

  const fretX = (fret: number) => PAD_LEFT + NUT_WIDTH + fret * FRET_WIDTH;
  const stringY = (s: number) => PAD_TOP + s * STRING_SPACING;
  const noteX = (fret: number) =>
    fret === 0 ? PAD_LEFT + NUT_WIDTH / 2 - 10 : fretX(fret) - FRET_WIDTH / 2;

  const currentStep = STEPS[step];

  return (
    <div className="my-6 rounded-xl border border-surface-700 bg-surface-800 p-4">
      {/* Step indicator */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">
          Octave Shapes
        </h3>
        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i === step
                  ? "bg-accent-400"
                  : i < step
                    ? "bg-accent-400/40"
                    : "bg-surface-600"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Rule badge */}
      <AnimatePresence mode="wait">
        {currentStep.rule && (
          <motion.div
            key={currentStep.rule}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="mb-3 inline-block rounded-md bg-accent-500/15 px-2.5 py-1 text-xs font-medium text-accent-400"
          >
            {currentStep.rule}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SVG Fretboard */}
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

          {/* Tap targets for all fret positions */}
          {Array.from({ length: NUM_STRINGS }, (_, sIdx) =>
            Array.from({ length: NUM_FRETS + 1 }, (_, fret) => {
              if (fret === 0) return null;
              // Skip positions that already have dedicated clickable dots
              const isRoot = sIdx === ROOT.string && fret === ROOT.fret;
              const isVisibleOctave = visiblePositions.some(
                (p) => p.string === sIdx && p.fret === fret
              );
              if (isRoot || isVisibleOctave) return null;

              const cx = noteX(fret);
              const cy = stringY(sIdx);
              const isTapped = tapped?.string === sIdx && tapped?.fret === fret;
              const midi = STANDARD_TUNING_MIDI[sIdx] + fret;
              const noteName = midiToNoteName(midi);

              return (
                <g
                  key={`tap-${sIdx}-${fret}`}
                  onClick={() => handleFretTap(sIdx, fret)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Invisible hit area */}
                  <rect
                    x={cx - FRET_WIDTH / 2 + 2}
                    y={cy - STRING_SPACING / 2}
                    width={FRET_WIDTH - 4}
                    height={STRING_SPACING}
                    fill="transparent"
                  />
                  {/* Show dot + note name on tap */}
                  {isTapped && (
                    <>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={8}
                        fill="oklch(55% 0.08 250)"
                        opacity={0.85}
                      />
                      <text
                        x={cx}
                        y={cy + 3}
                        textAnchor="middle"
                        fill="oklch(90% 0.01 250)"
                        fontSize={7}
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {noteName}
                      </text>
                    </>
                  )}
                </g>
              );
            })
          )}

          {/* Root note (always visible) */}
          <g
            onClick={() => playTone(ROOT.freq)}
            style={{ cursor: "pointer" }}
          >
            <circle
              cx={noteX(ROOT.fret)}
              cy={stringY(ROOT.string)}
              r={8}
              fill="oklch(75% 0.15 65)"
            />
            <text
              x={noteX(ROOT.fret)}
              y={stringY(ROOT.string) + 3}
              textAnchor="middle"
              fill="oklch(15% 0.01 250)"
              fontSize={8}
              fontWeight="bold"
              fontFamily="monospace"
            >
              {ROOT.label}
            </text>
          </g>

          {/* Octave positions */}
          {visiblePositions.map((pos) => {
            const isNew =
              newPosition &&
              newPosition.string === pos.string &&
              newPosition.fret === pos.fret;

            return (
              <motion.g
                key={`oct-${pos.string}-${pos.fret}`}
                initial={isNew ? { scale: 0, opacity: 0 } : false}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                style={{
                  cursor: "pointer",
                  transformOrigin: `${noteX(pos.fret)}px ${stringY(pos.string)}px`,
                }}
                onClick={() => playTone(pos.freq)}
              >
                <circle
                  cx={noteX(pos.fret)}
                  cy={stringY(pos.string)}
                  r={8}
                  fill="oklch(70% 0.15 170)"
                />
                <text
                  x={noteX(pos.fret)}
                  y={stringY(pos.string) + 3}
                  textAnchor="middle"
                  fill="oklch(15% 0.01 250)"
                  fontSize={8}
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {pos.label}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>

      {/* Navigation */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-1 rounded-md bg-surface-700 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <span className="text-xs text-text-muted">
          {step + 1} / {STEPS.length}
        </span>

        <button
          type="button"
          onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
          disabled={step === STEPS.length - 1}
          className="flex items-center gap-1 rounded-md bg-surface-700 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Description */}
      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="mt-3 text-xs leading-relaxed text-text-muted"
        >
          {currentStep.description}
        </motion.p>
      </AnimatePresence>

      {/* Click hint */}
      <p className="mt-2 text-[10px] text-text-muted/60">
        Click anywhere on the fretboard to hear the note.
      </p>
    </div>
  );
}
