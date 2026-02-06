"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Constants ───

const STAFF_LINE_SPACING = 12;
const HALF_SPACE = STAFF_LINE_SPACING / 2;
const SLOT_WIDTH = 52;
const CLEF_WIDTH = 50;
const PADDING_TOP = 36;
const PADDING_BOTTOM = 36;
const PADDING_LEFT = 16;
const PADDING_RIGHT = 16;

// ─── Note Position Data ───

interface NotePosition {
  name: string;
  midi: number;
  /** Steps from bottom staff line (0 = line 1, each step = one half-space up) */
  stepsFromBottom: number;
}

/** Treble clef: C4 (ledger below) through A5 (ledger above) — 13 positions */
const TREBLE_POSITIONS: NotePosition[] = [
  { name: "C4", midi: 60, stepsFromBottom: -2 },
  { name: "D4", midi: 62, stepsFromBottom: -1 },
  { name: "E4", midi: 64, stepsFromBottom: 0 },
  { name: "F4", midi: 65, stepsFromBottom: 1 },
  { name: "G4", midi: 67, stepsFromBottom: 2 },
  { name: "A4", midi: 69, stepsFromBottom: 3 },
  { name: "B4", midi: 71, stepsFromBottom: 4 },
  { name: "C5", midi: 72, stepsFromBottom: 5 },
  { name: "D5", midi: 74, stepsFromBottom: 6 },
  { name: "E5", midi: 76, stepsFromBottom: 7 },
  { name: "F5", midi: 77, stepsFromBottom: 8 },
  { name: "G5", midi: 79, stepsFromBottom: 9 },
  { name: "A5", midi: 81, stepsFromBottom: 10 },
];

/** Bass clef: E2 (ledger below) through C4 (ledger above) — 13 positions */
const BASS_POSITIONS: NotePosition[] = [
  { name: "E2", midi: 40, stepsFromBottom: -2 },
  { name: "F2", midi: 41, stepsFromBottom: -1 },
  { name: "G2", midi: 43, stepsFromBottom: 0 },
  { name: "A2", midi: 45, stepsFromBottom: 1 },
  { name: "B2", midi: 47, stepsFromBottom: 2 },
  { name: "C3", midi: 48, stepsFromBottom: 3 },
  { name: "D3", midi: 50, stepsFromBottom: 4 },
  { name: "E3", midi: 52, stepsFromBottom: 5 },
  { name: "F3", midi: 53, stepsFromBottom: 6 },
  { name: "G3", midi: 55, stepsFromBottom: 7 },
  { name: "A3", midi: 57, stepsFromBottom: 8 },
  { name: "B3", midi: 59, stepsFromBottom: 9 },
  { name: "C4", midi: 60, stepsFromBottom: 10 },
];

// ─── Helpers ───

function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Y position for a given stepsFromBottom value (0 = bottom line = line 1) */
function stepsToY(steps: number): number {
  // Bottom staff line is at y = PADDING_TOP + 4 * STAFF_LINE_SPACING
  // Each step up moves HALF_SPACE pixels upward
  return PADDING_TOP + 4 * STAFF_LINE_SPACING - steps * HALF_SPACE;
}

/** Check if a position needs a ledger line */
function needsLedgerLine(steps: number): boolean {
  // Below staff: steps -2 (on ledger), -1 (in space below)
  // Above staff: steps 10 (on ledger), 9 (in space above)
  return steps <= -2 || steps >= 10;
}

/** Get the ledger line Y positions needed for a given steps value */
function getLedgerLineYs(steps: number): number[] {
  const ys: number[] = [];
  if (steps <= -2) {
    // Ledger lines below: at steps -2, -4, etc. (even negative steps)
    for (let s = -2; s >= steps; s -= 2) {
      ys.push(stepsToY(s));
    }
  }
  if (steps >= 10) {
    // Ledger lines above: at steps 10, 12, etc. (even steps >= 10)
    for (let s = 10; s <= steps; s += 2) {
      ys.push(stepsToY(s));
    }
  }
  return ys;
}

// ─── Types ───

interface PlacedNote {
  position: NotePosition;
}

interface StaffComposerProps {
  clef?: "treble" | "bass";
  slots?: number;
  bpm?: number;
  showNoteNames?: boolean;
}

// ─── Component ───

export function StaffComposer({
  clef = "treble",
  slots = 8,
  bpm: initialBpm = 120,
  showNoteNames = true,
}: StaffComposerProps) {
  const positions = clef === "treble" ? TREBLE_POSITIONS : BASS_POSITIONS;

  const [notes, setNotes] = useState<(PlacedNote | null)[]>(
    () => Array.from({ length: slots }, () => null)
  );
  const [hoverInfo, setHoverInfo] = useState<{
    slotIndex: number;
    position: NotePosition;
  } | null>(null);
  const [bpm, setBpm] = useState(initialBpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(-1);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentSlotRef = useRef(0);
  const notesRef = useRef(notes);
  const bpmRef = useRef(bpm);

  // Keep refs in sync
  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  // ─── SVG dimensions ───
  const staffWidth = CLEF_WIDTH + slots * SLOT_WIDTH;
  const totalWidth = PADDING_LEFT + staffWidth + PADDING_RIGHT;
  const totalHeight = PADDING_TOP + 4 * STAFF_LINE_SPACING + PADDING_BOTTOM;

  const staffLeft = PADDING_LEFT + CLEF_WIDTH;

  // ─── Audio ───

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
    (midi: number, time?: number) => {
      const ctx = getAudioContext();
      const freq = midiToFrequency(midi);
      const now = time ?? ctx.currentTime;
      const duration = 0.4;

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
    [getAudioContext]
  );

  // ─── Playback scheduler ───

  const scheduleNote = useCallback(
    (time: number, slotIndex: number) => {
      const note = notesRef.current[slotIndex];
      if (!note) return; // rest
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const freq = midiToFrequency(note.position.midi);
      const beatDuration = 60 / bpmRef.current;
      const duration = beatDuration * 0.8;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.3, time + 0.01);
      gain.gain.setValueAtTime(0.3, time + duration - 0.05);
      gain.gain.linearRampToValueAtTime(0, time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + duration + 0.01);
    },
    []
  );

  const advanceSlot = useCallback(() => {
    const beatDuration = 60 / bpmRef.current;
    nextNoteTimeRef.current += beatDuration;
    currentSlotRef.current += 1;
    setCurrentSlot(currentSlotRef.current);
  }, []);

  const scheduler = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // Stop after last slot
    if (currentSlotRef.current >= notesRef.current.length) {
      return;
    }

    while (
      currentSlotRef.current < notesRef.current.length &&
      nextNoteTimeRef.current < ctx.currentTime + 0.1
    ) {
      scheduleNote(nextNoteTimeRef.current, currentSlotRef.current);
      advanceSlot();
    }
  }, [scheduleNote, advanceSlot]);

  // Check if playback finished
  useEffect(() => {
    if (isPlaying && currentSlot >= notes.length) {
      // Allow last note to finish playing before stopping
      const beatDuration = 60 / bpm;
      const timeout = setTimeout(() => {
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsPlaying(false);
        setCurrentSlot(-1);
        currentSlotRef.current = 0;
      }, beatDuration * 800);
      return () => clearTimeout(timeout);
    }
  }, [isPlaying, currentSlot, notes.length, bpm]);

  const start = useCallback(() => {
    if (isPlaying) return;
    const ctx = getAudioContext();

    currentSlotRef.current = 0;
    setCurrentSlot(0);
    nextNoteTimeRef.current = ctx.currentTime;

    intervalRef.current = setInterval(scheduler, 25);
    setIsPlaying(true);
  }, [isPlaying, getAudioContext, scheduler]);

  const stop = useCallback(() => {
    if (!isPlaying) return;

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsPlaying(false);
    setCurrentSlot(-1);
    currentSlotRef.current = 0;
  }, [isPlaying]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, []);

  // ─── Interaction ───

  const slotCenterX = (slotIndex: number) =>
    staffLeft + slotIndex * SLOT_WIDTH + SLOT_WIDTH / 2;

  const findNearestPosition = (svgY: number): NotePosition | null => {
    let closest: NotePosition | null = null;
    let minDist = Infinity;

    for (const pos of positions) {
      const posY = stepsToY(pos.stepsFromBottom);
      const dist = Math.abs(svgY - posY);
      if (dist < minDist) {
        minDist = dist;
        closest = pos;
      }
    }

    // Only snap if within a reasonable distance
    if (minDist > HALF_SPACE + 2) return null;
    return closest;
  };

  const handleStaffClick = (slotIndex: number, svgY: number) => {
    const position = findNearestPosition(svgY);
    if (!position) return;

    setNotes((prev) => {
      const next = [...prev];
      // Toggle: if same note already placed, remove it
      if (next[slotIndex]?.position.midi === position.midi) {
        next[slotIndex] = null;
      } else {
        next[slotIndex] = { position };
        // Play the note immediately on placement
        playNote(position.midi);
      }
      return next;
    });
  };

  const handleStaffMouseMove = (
    e: React.MouseEvent<SVGRectElement>,
    slotIndex: number
  ) => {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    const position = findNearestPosition(svgPt.y);
    if (position) {
      setHoverInfo({ slotIndex, position });
    } else {
      setHoverInfo(null);
    }
  };

  const handleClear = () => {
    stop();
    setNotes(Array.from({ length: slots }, () => null));
  };

  // ─── Render ───

  return (
    <div className="my-6 rounded-xl border border-surface-700 bg-surface-800 p-4">
      <div className="overflow-x-auto">
        <svg
          width={totalWidth}
          height={totalHeight}
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          className="min-w-fit"
        >
          {/* Staff lines */}
          {Array.from({ length: 5 }, (_, i) => {
            const y = PADDING_TOP + i * STAFF_LINE_SPACING;
            return (
              <line
                key={`line-${i}`}
                x1={PADDING_LEFT}
                y1={y}
                x2={PADDING_LEFT + staffWidth}
                y2={y}
                stroke="oklch(40% 0.02 250)"
                strokeWidth={1}
              />
            );
          })}

          {/* Clef symbol */}
          {clef === "treble" ? (
            <TrebleClefSymbol x={PADDING_LEFT + 8} y={PADDING_TOP} />
          ) : (
            <BassClefSymbol x={PADDING_LEFT + 8} y={PADDING_TOP} />
          )}

          {/* Slot dividers (light vertical lines) */}
          {Array.from({ length: slots + 1 }, (_, i) => {
            const x = staffLeft + i * SLOT_WIDTH;
            return (
              <line
                key={`divider-${i}`}
                x1={x}
                y1={PADDING_TOP - 2}
                x2={x}
                y2={PADDING_TOP + 4 * STAFF_LINE_SPACING + 2}
                stroke="oklch(30% 0.02 250)"
                strokeWidth={i === 0 || i === slots ? 1.5 : 0.5}
              />
            );
          })}

          {/* Clickable slot areas */}
          {Array.from({ length: slots }, (_, slotIndex) => (
            <rect
              key={`slot-${slotIndex}`}
              x={staffLeft + slotIndex * SLOT_WIDTH}
              y={PADDING_TOP - PADDING_TOP + 4}
              width={SLOT_WIDTH}
              height={totalHeight - 8}
              fill="transparent"
              cursor="pointer"
              onClick={(e) => {
                const svg = e.currentTarget.ownerSVGElement;
                if (!svg) return;
                const pt = svg.createSVGPoint();
                pt.x = e.clientX;
                pt.y = e.clientY;
                const svgPt = pt.matrixTransform(
                  svg.getScreenCTM()?.inverse()
                );
                handleStaffClick(slotIndex, svgPt.y);
              }}
              onMouseMove={(e) => handleStaffMouseMove(e, slotIndex)}
              onMouseLeave={() => setHoverInfo(null)}
            />
          ))}

          {/* Playback highlight */}
          {isPlaying && currentSlot >= 0 && currentSlot < slots && (
            <rect
              x={staffLeft + currentSlot * SLOT_WIDTH}
              y={PADDING_TOP - 4}
              width={SLOT_WIDTH}
              height={4 * STAFF_LINE_SPACING + 8}
              rx={3}
              fill="oklch(75% 0.15 250 / 0.1)"
              pointerEvents="none"
            />
          )}

          {/* Hover ghost notehead */}
          {hoverInfo && (
            <NoteHead
              cx={slotCenterX(hoverInfo.slotIndex)}
              cy={stepsToY(hoverInfo.position.stepsFromBottom)}
              ghost
              noteName={showNoteNames ? hoverInfo.position.name : undefined}
              stepsFromBottom={hoverInfo.position.stepsFromBottom}
            />
          )}

          {/* Placed notes */}
          {notes.map((note, slotIndex) => {
            if (!note) return null;
            const cx = slotCenterX(slotIndex);
            const cy = stepsToY(note.position.stepsFromBottom);
            const isActive = isPlaying && slotIndex === currentSlot;

            return (
              <g key={`note-${slotIndex}`}>
                {/* Ledger lines */}
                {needsLedgerLine(note.position.stepsFromBottom) &&
                  getLedgerLineYs(note.position.stepsFromBottom).map(
                    (ly, i) => (
                      <line
                        key={`ledger-${slotIndex}-${i}`}
                        x1={cx - 14}
                        y1={ly}
                        x2={cx + 14}
                        y2={ly}
                        stroke="oklch(40% 0.02 250)"
                        strokeWidth={1}
                      />
                    )
                  )}
                <NoteHead
                  cx={cx}
                  cy={cy}
                  active={isActive}
                  noteName={showNoteNames ? note.position.name : undefined}
                  stepsFromBottom={note.position.stepsFromBottom}
                />
              </g>
            );
          })}

          {/* Ghost ledger lines for hover */}
          {hoverInfo &&
            needsLedgerLine(hoverInfo.position.stepsFromBottom) &&
            getLedgerLineYs(hoverInfo.position.stepsFromBottom).map(
              (ly, i) => (
                <line
                  key={`ghost-ledger-${i}`}
                  x1={slotCenterX(hoverInfo.slotIndex) - 14}
                  y1={ly}
                  x2={slotCenterX(hoverInfo.slotIndex) + 14}
                  y2={ly}
                  stroke="oklch(40% 0.02 250 / 0.4)"
                  strokeWidth={1}
                  pointerEvents="none"
                />
              )
            )}
        </svg>
      </div>

      {/* Controls */}
      <div className="mt-3 flex flex-wrap items-center gap-4">
        {/* Play/Stop */}
        <button
          onClick={isPlaying ? stop : start}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500 text-surface-900 transition-colors hover:bg-accent-400"
          aria-label={isPlaying ? "Stop" : "Play"}
        >
          {isPlaying ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="currentColor"
            >
              <rect x="1" y="1" width="4" height="12" rx="1" />
              <rect x="9" y="1" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="currentColor"
            >
              <polygon points="2,0 14,7 2,14" />
            </svg>
          )}
        </button>

        {/* BPM */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-text-muted">BPM</label>
          <input
            type="range"
            min={40}
            max={240}
            step={1}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-surface-600 accent-accent-400"
          />
          <span className="w-8 font-mono text-xs text-text-secondary">
            {bpm}
          </span>
        </div>

        {/* Clear */}
        <button
          onClick={handleClear}
          className="rounded-full bg-surface-700 px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-600 hover:text-text-primary"
        >
          Clear
        </button>

        {/* Clef label */}
        <span className="text-xs text-text-muted">
          {clef === "treble" ? "Treble" : "Bass"} clef &middot; {slots} slots
        </span>
      </div>
    </div>
  );
}

// ─── Sub-components ───

function NoteHead({
  cx,
  cy,
  ghost,
  active,
  noteName,
  stepsFromBottom,
}: {
  cx: number;
  cy: number;
  ghost?: boolean;
  active?: boolean;
  noteName?: string;
  stepsFromBottom: number;
}) {
  const fill = ghost
    ? "oklch(75% 0.15 250 / 0.3)"
    : active
    ? "oklch(85% 0.18 250)"
    : "oklch(75% 0.15 250)";

  // Place label above for lower notes, below for upper notes
  const labelAbove = stepsFromBottom >= 4;
  const labelY = labelAbove ? cy - 12 : cy + 16;

  return (
    <g pointerEvents="none">
      <ellipse
        cx={cx}
        cy={cy}
        rx={7}
        ry={5}
        fill={fill}
        transform={`rotate(-10 ${cx} ${cy})`}
      />
      {active && (
        <ellipse
          cx={cx}
          cy={cy}
          rx={11}
          ry={8}
          fill="none"
          stroke="oklch(75% 0.15 250 / 0.4)"
          strokeWidth={1.5}
          transform={`rotate(-10 ${cx} ${cy})`}
        />
      )}
      {noteName && (
        <text
          x={cx}
          y={labelY}
          textAnchor="middle"
          fill={ghost ? "oklch(65% 0.1 250 / 0.5)" : "oklch(75% 0.1 250)"}
          fontSize={9}
          fontFamily="monospace"
          fontWeight="bold"
        >
          {noteName}
        </text>
      )}
    </g>
  );
}

// ─── Clef SVG Symbols ───

function TrebleClefSymbol({ x, y }: { x: number; y: number }) {
  // Simplified treble clef glyph centered around the G line (line 2 = y + 2*spacing)
  return (
    <text
      x={x}
      y={y + 3.65 * STAFF_LINE_SPACING}
      fontSize={56}
      fontFamily="serif"
      fill="oklch(55% 0.02 250)"
    >
      {"\u{1D11E}"}
    </text>
  );
}

function BassClefSymbol({ x, y }: { x: number; y: number }) {
  // Simplified bass clef glyph centered around the F line (line 4 = y + 1*spacing)
  return (
    <text
      x={x}
      y={y + 2.7 * STAFF_LINE_SPACING}
      fontSize={38}
      fontFamily="serif"
      fill="oklch(55% 0.02 250)"
    >
      {"\u{1D122}"}
    </text>
  );
}
