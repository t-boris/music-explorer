"use client";

import { useCallback, useRef, useState } from "react";

// ─── Constants ───

const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

// Standard tuning MIDI numbers (string 6 to string 1)
const STANDARD_TUNING_MIDI = [40, 45, 50, 55, 59, 64]; // E2, A2, D3, G3, B3, E4

// Fret marker positions
const SINGLE_DOTS = [3, 5, 7, 9, 15, 17, 19, 21];
const DOUBLE_DOTS = [12, 24];

function midiToNoteName(midi: number): string {
  return NOTE_NAMES[midi % 12];
}

function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function tuningToMidi(tuning: string[]): number[] {
  // Convert note names like ["E", "A", "D", "G", "B", "E"] to MIDI
  // Uses standard octave assignments for standard tuning
  return STANDARD_TUNING_MIDI;
}

// ─── Types ───

interface HighlightPosition {
  string: number;
  fret: number;
  label?: string;
  color?: string;
}

interface FretboardDiagramProps {
  frets?: number;
  highlightNotes?: string[];
  highlightPositions?: HighlightPosition[];
  rootNote?: string;
  interactive?: boolean;
  showNoteNames?: boolean;
  tuning?: string[];
}

// ─── SVG Layout Constants ───

const STRING_SPACING = 28;
const FRET_WIDTH = 56;
const NUT_WIDTH = 6;
const PADDING_LEFT = 32;
const PADDING_TOP = 24;
const PADDING_BOTTOM = 28;
const DOT_RADIUS = 10;

// ─── Component ───

export function FretboardDiagram({
  frets = 12,
  highlightNotes,
  highlightPositions,
  rootNote,
  interactive = true,
  showNoteNames = true,
  tuning = ["E", "A", "D", "G", "B", "E"],
}: FretboardDiagramProps) {
  const [hoveredNote, setHoveredNote] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const stringMidi = tuningToMidi(tuning);
  const numStrings = tuning.length;

  const totalWidth = PADDING_LEFT + NUT_WIDTH + frets * FRET_WIDTH + 16;
  const totalHeight =
    PADDING_TOP + (numStrings - 1) * STRING_SPACING + PADDING_BOTTOM;

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // ─── Play a note ───
  const playNote = useCallback(
    (midi: number) => {
      if (!interactive) return;
      const ctx = getAudioContext();
      const freq = midiToFrequency(midi);
      const now = ctx.currentTime;
      const duration = 0.3;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
      gain.gain.setValueAtTime(0.3, now + duration - 0.05);
      gain.gain.linearRampToValueAtTime(0, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.01);
    },
    [interactive, getAudioContext]
  );

  // ─── Check if a note should be highlighted ───
  const isHighlighted = (stringIdx: number, fret: number): boolean => {
    const midi = stringMidi[stringIdx] + fret;
    const noteName = midiToNoteName(midi);

    if (highlightPositions) {
      return highlightPositions.some(
        (p) => p.string === stringIdx + 1 && p.fret === fret
      );
    }

    if (highlightNotes) {
      return highlightNotes.includes(noteName);
    }

    return false;
  };

  const isRoot = (stringIdx: number, fret: number): boolean => {
    if (!rootNote) return false;
    const midi = stringMidi[stringIdx] + fret;
    const noteName = midiToNoteName(midi);
    return noteName === rootNote;
  };

  // ─── Get position label ───
  const getPositionLabel = (stringIdx: number, fret: number): string | undefined => {
    if (highlightPositions) {
      const pos = highlightPositions.find(
        (p) => p.string === stringIdx + 1 && p.fret === fret
      );
      return pos?.label;
    }
    return undefined;
  };

  // ─── Fret X position ───
  const fretX = (fret: number) =>
    PADDING_LEFT + NUT_WIDTH + fret * FRET_WIDTH;

  // ─── String Y position ───
  const stringY = (stringIdx: number) =>
    PADDING_TOP + stringIdx * STRING_SPACING;

  // ─── Note center position (between fret wires) ───
  const noteX = (fret: number) => {
    if (fret === 0) return PADDING_LEFT + NUT_WIDTH / 2 - 14;
    return fretX(fret) - FRET_WIDTH / 2;
  };

  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-surface-700 bg-surface-800 p-4">
      <svg
        width={totalWidth}
        height={totalHeight}
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        className="min-w-fit"
      >
        {/* Background */}
        <rect
          x={PADDING_LEFT}
          y={PADDING_TOP - 8}
          width={totalWidth - PADDING_LEFT - 16}
          height={(numStrings - 1) * STRING_SPACING + 16}
          rx={4}
          fill="oklch(25% 0.015 250)"
        />

        {/* Nut */}
        <rect
          x={PADDING_LEFT}
          y={PADDING_TOP - 6}
          width={NUT_WIDTH}
          height={(numStrings - 1) * STRING_SPACING + 12}
          rx={2}
          fill="oklch(60% 0.02 250)"
        />

        {/* Fret wires */}
        {Array.from({ length: frets }, (_, i) => i + 1).map((fret) => (
          <line
            key={`fret-${fret}`}
            x1={fretX(fret)}
            y1={PADDING_TOP - 6}
            x2={fretX(fret)}
            y2={PADDING_TOP + (numStrings - 1) * STRING_SPACING + 6}
            stroke="oklch(40% 0.02 250)"
            strokeWidth={1.5}
          />
        ))}

        {/* Fret dots */}
        {Array.from({ length: frets }, (_, i) => i + 1).map((fret) => {
          if (SINGLE_DOTS.includes(fret)) {
            return (
              <circle
                key={`dot-${fret}`}
                cx={noteX(fret)}
                cy={PADDING_TOP + ((numStrings - 1) * STRING_SPACING) / 2}
                r={3}
                fill="oklch(40% 0.02 250)"
              />
            );
          }
          if (DOUBLE_DOTS.includes(fret)) {
            const midY =
              PADDING_TOP + ((numStrings - 1) * STRING_SPACING) / 2;
            return (
              <g key={`dot-${fret}`}>
                <circle
                  cx={noteX(fret)}
                  cy={midY - 14}
                  r={3}
                  fill="oklch(40% 0.02 250)"
                />
                <circle
                  cx={noteX(fret)}
                  cy={midY + 14}
                  r={3}
                  fill="oklch(40% 0.02 250)"
                />
              </g>
            );
          }
          return null;
        })}

        {/* Strings */}
        {tuning.map((_, stringIdx) => {
          const thickness = 1 + stringIdx * 0.3;
          return (
            <line
              key={`string-${stringIdx}`}
              x1={PADDING_LEFT + NUT_WIDTH}
              y1={stringY(stringIdx)}
              x2={fretX(frets)}
              y2={stringY(stringIdx)}
              stroke="oklch(55% 0.02 250)"
              strokeWidth={thickness}
            />
          );
        })}

        {/* String labels */}
        {tuning.map((name, stringIdx) => (
          <text
            key={`label-${stringIdx}`}
            x={PADDING_LEFT - 8}
            y={stringY(stringIdx) + 4}
            textAnchor="end"
            fill="oklch(50% 0.02 250)"
            fontSize={11}
            fontFamily="monospace"
          >
            {name}
          </text>
        ))}

        {/* Fret numbers */}
        {Array.from({ length: frets }, (_, i) => i + 1).map((fret) => (
          <text
            key={`fretnum-${fret}`}
            x={noteX(fret)}
            y={PADDING_TOP + (numStrings - 1) * STRING_SPACING + 20}
            textAnchor="middle"
            fill="oklch(40% 0.02 250)"
            fontSize={9}
            fontFamily="monospace"
          >
            {fret}
          </text>
        ))}

        {/* Highlighted notes */}
        {tuning.map((_, stringIdx) =>
          Array.from({ length: frets + 1 }, (_, fret) => {
            const highlighted = isHighlighted(stringIdx, fret);
            if (!highlighted) return null;

            const midi = stringMidi[stringIdx] + fret;
            const noteName = midiToNoteName(midi);
            const root = isRoot(stringIdx, fret);
            const label = getPositionLabel(stringIdx, fret);
            const cx = fret === 0 ? PADDING_LEFT - 14 : noteX(fret);
            const cy = stringY(stringIdx);

            return (
              <g
                key={`note-${stringIdx}-${fret}`}
                onClick={() => playNote(midi)}
                onMouseEnter={() =>
                  setHoveredNote(`${noteName} (${Math.round(midiToFrequency(midi))} Hz)`)
                }
                onMouseLeave={() => setHoveredNote(null)}
                style={{ cursor: interactive ? "pointer" : "default" }}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={DOT_RADIUS}
                  fill={
                    root
                      ? "oklch(75% 0.15 65)"
                      : "oklch(75% 0.15 65 / 0.4)"
                  }
                  stroke={root ? "oklch(75% 0.15 65)" : "none"}
                  strokeWidth={root ? 2 : 0}
                />
                {showNoteNames && (
                  <text
                    x={cx}
                    y={cy + 4}
                    textAnchor="middle"
                    fill={root ? "oklch(15% 0.01 250)" : "oklch(95% 0.01 250)"}
                    fontSize={9}
                    fontWeight={root ? "bold" : "normal"}
                    fontFamily="monospace"
                  >
                    {label || noteName}
                  </text>
                )}
              </g>
            );
          })
        )}
      </svg>

      {/* Hover info */}
      {hoveredNote && (
        <div className="mt-2 text-center font-mono text-xs text-text-secondary">
          {hoveredNote}
        </div>
      )}
    </div>
  );
}
