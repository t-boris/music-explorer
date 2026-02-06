"use client";

import { useCallback, useRef, useState } from "react";
import { Piano } from "lucide-react";

// ─── Note Data ───

interface NoteInfo {
  name: string;
  midi: number;
  stepsFromBottom: number;
  position: string;
  /** Guitar fretboard position (written pitch sounds 1 octave lower) */
  guitar: string;
}

const TREBLE_NOTES: NoteInfo[] = [
  { name: "C4", midi: 60, stepsFromBottom: -2, position: "Ledger line below", guitar: "3rd fret, A string" },
  { name: "D4", midi: 62, stepsFromBottom: -1, position: "Below staff", guitar: "Open D string" },
  { name: "E4", midi: 64, stepsFromBottom: 0, position: "Line 1", guitar: "2nd fret, D string" },
  { name: "F4", midi: 65, stepsFromBottom: 1, position: "Space 1", guitar: "3rd fret, D string" },
  { name: "G4", midi: 67, stepsFromBottom: 2, position: "Line 2", guitar: "Open G string" },
  { name: "A4", midi: 69, stepsFromBottom: 3, position: "Space 2", guitar: "2nd fret, G string" },
  { name: "B4", midi: 71, stepsFromBottom: 4, position: "Line 3", guitar: "Open B string" },
  { name: "C5", midi: 72, stepsFromBottom: 5, position: "Space 3", guitar: "1st fret, B string" },
  { name: "D5", midi: 74, stepsFromBottom: 6, position: "Line 4", guitar: "3rd fret, B string" },
  { name: "E5", midi: 76, stepsFromBottom: 7, position: "Space 4", guitar: "Open high E string" },
  { name: "F5", midi: 77, stepsFromBottom: 8, position: "Line 5", guitar: "1st fret, high E string" },
  { name: "G5", midi: 79, stepsFromBottom: 9, position: "Above staff", guitar: "3rd fret, high E string" },
  { name: "A5", midi: 81, stepsFromBottom: 10, position: "Ledger line above", guitar: "5th fret, high E string" },
];

// ─── SVG Layout ───

const LINE_SPACING = 14;
const HALF_SPACE = LINE_SPACING / 2;
const PAD_TOP = 32;
const PAD_BOTTOM = 28;
const PAD_LEFT = 16;
const CLEF_WIDTH = 44;
const NOTE_AREA_WIDTH = 260;
const SVG_WIDTH = PAD_LEFT + CLEF_WIDTH + NOTE_AREA_WIDTH + 16;
const SVG_HEIGHT = PAD_TOP + 4 * LINE_SPACING + PAD_BOTTOM;

// ─── Helpers ───

function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function stepsToY(steps: number): number {
  return PAD_TOP + 4 * LINE_SPACING - steps * HALF_SPACE;
}

function getLedgerLineYs(steps: number): number[] {
  const ys: number[] = [];
  if (steps <= -2) {
    for (let s = -2; s >= steps; s -= 2) ys.push(stepsToY(s));
  }
  if (steps >= 10) {
    for (let s = 10; s <= steps; s += 2) ys.push(stepsToY(s));
  }
  return ys;
}

// ─── Component ───

export function NoteExplorer() {
  const [activeNote, setActiveNote] = useState<NoteInfo | null>(null);
  const [playingMidi, setPlayingMidi] = useState<number | null>(null);
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

  const playNote = useCallback(
    (note: NoteInfo) => {
      const ctx = getAudioContext();
      const freq = midiToFrequency(note.midi);
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
      gain.gain.setValueAtTime(0.3, now + 0.35);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);

      setActiveNote(note);
      setPlayingMidi(note.midi);
      setTimeout(() => setPlayingMidi(null), 400);
    },
    [getAudioContext]
  );

  const noteSpacing = NOTE_AREA_WIDTH / TREBLE_NOTES.length;
  const noteStartX = PAD_LEFT + CLEF_WIDTH + noteSpacing / 2;

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-6">
      <h2 className="mb-2 flex items-center gap-2 font-heading text-lg text-text-primary">
        <Piano className="h-5 w-5 text-accent-400" />
        Note Explorer
      </h2>
      <p className="mb-4 text-xs text-text-muted">
        Click any note to hear it and see its position
      </p>

      {/* Staff with all notes */}
      <div className="overflow-x-auto">
        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="max-w-full"
        >
          {/* Staff lines */}
          {Array.from({ length: 5 }, (_, i) => (
            <line
              key={`line-${i}`}
              x1={PAD_LEFT}
              y1={PAD_TOP + i * LINE_SPACING}
              x2={PAD_LEFT + CLEF_WIDTH + NOTE_AREA_WIDTH}
              y2={PAD_TOP + i * LINE_SPACING}
              stroke="oklch(40% 0.02 250)"
              strokeWidth={1}
            />
          ))}

          {/* Treble clef */}
          <text
            x={PAD_LEFT + 4}
            y={PAD_TOP + 3.65 * LINE_SPACING}
            fontSize={56}
            fontFamily="serif"
            fill="oklch(55% 0.02 250)"
          >
            {"\u{1D11E}"}
          </text>

          {/* Notes */}
          {TREBLE_NOTES.map((note, i) => {
            const cx = noteStartX + i * noteSpacing;
            const cy = stepsToY(note.stepsFromBottom);
            const isPlaying = playingMidi === note.midi;
            const isActive = activeNote?.midi === note.midi;
            const ledgerYs = getLedgerLineYs(note.stepsFromBottom);

            return (
              <g
                key={note.name}
                onClick={() => playNote(note)}
                style={{ cursor: "pointer" }}
              >
                {/* Hit area */}
                <rect
                  x={cx - noteSpacing / 2}
                  y={0}
                  width={noteSpacing}
                  height={SVG_HEIGHT}
                  fill="transparent"
                />

                {/* Highlight column */}
                {isActive && (
                  <rect
                    x={cx - noteSpacing / 2 + 1}
                    y={PAD_TOP - 6}
                    width={noteSpacing - 2}
                    height={4 * LINE_SPACING + 12}
                    rx={3}
                    fill="oklch(75% 0.15 250 / 0.08)"
                  />
                )}

                {/* Ledger lines */}
                {ledgerYs.map((ly, j) => (
                  <line
                    key={`ledger-${i}-${j}`}
                    x1={cx - 12}
                    y1={ly}
                    x2={cx + 12}
                    y2={ly}
                    stroke="oklch(40% 0.02 250)"
                    strokeWidth={1}
                  />
                ))}

                {/* Notehead */}
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={6}
                  ry={4.5}
                  fill={
                    isPlaying
                      ? "oklch(85% 0.18 250)"
                      : isActive
                      ? "oklch(75% 0.15 250)"
                      : "oklch(60% 0.1 250)"
                  }
                  transform={`rotate(-10 ${cx} ${cy})`}
                />

                {/* Glow when playing */}
                {isPlaying && (
                  <ellipse
                    cx={cx}
                    cy={cy}
                    rx={10}
                    ry={7}
                    fill="none"
                    stroke="oklch(75% 0.15 250 / 0.5)"
                    strokeWidth={1.5}
                    transform={`rotate(-10 ${cx} ${cy})`}
                  />
                )}

                {/* Note name below */}
                <text
                  x={cx}
                  y={PAD_TOP + 4 * LINE_SPACING + 16}
                  textAnchor="middle"
                  fill={
                    isActive
                      ? "oklch(75% 0.1 250)"
                      : "oklch(45% 0.02 250)"
                  }
                  fontSize={8}
                  fontFamily="monospace"
                  fontWeight={isActive ? "bold" : "normal"}
                >
                  {note.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Active note info panel */}
      {activeNote && (
        <div className="mt-3 rounded-lg border border-surface-700 bg-surface-900/50 px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
            <div>
              <span className="text-text-muted">Note: </span>
              <span className="font-mono font-bold text-accent-400">
                {activeNote.name}
              </span>
            </div>
            <div>
              <span className="text-text-muted">Staff: </span>
              <span className="text-text-secondary">
                {activeNote.position}
              </span>
            </div>
            <div>
              <span className="text-text-muted">Frequency: </span>
              <span className="font-mono text-text-secondary">
                {Math.round(midiToFrequency(activeNote.midi))} Hz
              </span>
            </div>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 border-t border-surface-700 pt-1.5 text-sm">
            <span className="text-text-muted">Guitar: </span>
            <span className="font-medium text-amber-400">
              {activeNote.guitar}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
