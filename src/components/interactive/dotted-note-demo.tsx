"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

// ─── Note type data ───

interface NoteType {
  label: string;
  beats: number;
  symbol: string;
}

const NOTE_TYPES: Record<string, NoteType> = {
  half: { label: "Half note", beats: 2, symbol: "𝅗𝅥" },
  quarter: { label: "Quarter note", beats: 1, symbol: "♩" },
  eighth: { label: "Eighth note", beats: 0.5, symbol: "♪" },
};

// ─── SVG Layout ───

const PAD_X = 16;
const PAD_Y = 12;
const ROW_HEIGHT = 28;
const ROW_GAP = 16;
const GRID_LEFT = 120;
const BEAT_UNIT = 50; // pixels per beat
const MAX_BEATS = 4; // grid shows 4 beats
const GRID_WIDTH = MAX_BEATS * BEAT_UNIT;
const SVG_WIDTH = GRID_LEFT + GRID_WIDTH + PAD_X + 20;
const SVG_HEIGHT = PAD_Y + ROW_HEIGHT + ROW_GAP + ROW_HEIGHT + PAD_Y + 20;

// ─── Props ───

interface DottedNoteDemoProps {
  defaultNote?: "half" | "quarter" | "eighth";
}

// ─── Component ───

export function DottedNoteDemo({ defaultNote = "quarter" }: DottedNoteDemoProps) {
  const [selectedNote, setSelectedNote] = useState<"half" | "quarter" | "eighth">(defaultNote);
  const [bpm, setBpm] = useState(100);
  const [playing, setPlaying] = useState<"original" | "dotted" | "compare" | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const note = NOTE_TYPES[selectedNote];
  const dottedBeats = note.beats * 1.5;
  const addedBeats = note.beats * 0.5;

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const stopAll = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
    setPlaying(null);
  }, []);

  const playTone = useCallback(
    (startDelay: number, durationBeats: number): number => {
      const ctx = getAudioContext();
      const durationSec = (durationBeats * 60) / bpm;
      const startTime = ctx.currentTime + startDelay;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 440;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
      gain.gain.setValueAtTime(0.3, startTime + durationSec - 0.05);
      gain.gain.linearRampToValueAtTime(0, startTime + durationSec);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + durationSec + 0.01);

      return durationSec;
    },
    [getAudioContext, bpm]
  );

  const handlePlay = useCallback(
    (mode: "original" | "dotted" | "compare") => {
      stopAll();
      setPlaying(mode);

      if (mode === "original") {
        const dur = playTone(0, note.beats);
        const t = setTimeout(() => setPlaying(null), dur * 1000 + 50);
        timerRef.current.push(t);
      } else if (mode === "dotted") {
        const dur = playTone(0, dottedBeats);
        const t = setTimeout(() => setPlaying(null), dur * 1000 + 50);
        timerRef.current.push(t);
      } else {
        // Compare: play original, gap, then dotted
        const origDur = playTone(0, note.beats);
        const gap = 0.3;
        const dottedDur = playTone(origDur + gap, dottedBeats);
        const totalMs = (origDur + gap + dottedDur) * 1000 + 50;
        const t = setTimeout(() => setPlaying(null), totalMs);
        timerRef.current.push(t);
      }
    },
    [note.beats, dottedBeats, playTone, stopAll]
  );

  // ─── SVG positions ───
  const dottedBarY = PAD_Y;
  const plainBarY = PAD_Y + ROW_HEIGHT + ROW_GAP;
  const barHeight = ROW_HEIGHT;

  const originalBarWidth = note.beats * BEAT_UNIT;
  const dotAdditionWidth = addedBeats * BEAT_UNIT;
  const plainBarWidth = originalBarWidth;

  return (
    <div className="my-6 rounded-xl border border-surface-700 bg-surface-800 p-4">
      <h3 className="mb-3 text-sm font-semibold text-text-primary">
        Dotted Notes — How the Dot Works
      </h3>

      {/* Note selector buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(NOTE_TYPES) as Array<"half" | "quarter" | "eighth">).map((key) => (
          <button
            key={key}
            onClick={() => {
              stopAll();
              setSelectedNote(key);
            }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedNote === key
                ? "bg-accent-500 text-surface-900"
                : "bg-surface-700 text-text-secondary hover:bg-surface-600"
            }`}
          >
            {NOTE_TYPES[key].symbol} {NOTE_TYPES[key].label}
          </button>
        ))}
      </div>

      {/* Calculation display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedNote}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          className="mb-4 flex items-center gap-3 rounded-lg bg-surface-700/50 px-4 py-2.5"
        >
          <span className="font-mono text-lg text-accent-400">
            {note.beats} {note.beats === 1 ? "beat" : "beats"}
          </span>
          <span className="text-text-muted">+</span>
          <span className="font-mono text-lg text-accent-300">
            {addedBeats} {addedBeats === 1 ? "beat" : "beats"}
          </span>
          <span className="text-text-muted">=</span>
          <span className="font-mono text-lg font-bold text-text-primary">
            {dottedBeats} beats
          </span>
        </motion.div>
      </AnimatePresence>

      {/* SVG Visualization */}
      <div className="overflow-x-auto rounded-lg">
        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="min-w-fit"
        >
          {/* Beat grid lines */}
          {Array.from({ length: MAX_BEATS + 1 }, (_, i) => (
            <line
              key={`grid-${i}`}
              x1={GRID_LEFT + i * BEAT_UNIT}
              y1={PAD_Y - 4}
              x2={GRID_LEFT + i * BEAT_UNIT}
              y2={SVG_HEIGHT - PAD_Y + 4}
              stroke="oklch(35% 0.02 250)"
              strokeWidth={i === 0 ? 1 : 0.5}
              strokeDasharray={i === 0 ? "none" : "3 3"}
            />
          ))}

          {/* Beat numbers */}
          {Array.from({ length: MAX_BEATS }, (_, i) => (
            <text
              key={`beat-num-${i}`}
              x={GRID_LEFT + i * BEAT_UNIT + BEAT_UNIT / 2}
              y={SVG_HEIGHT - 2}
              textAnchor="middle"
              fill="oklch(45% 0.02 250)"
              fontSize={9}
              fontFamily="monospace"
            >
              {i + 1}
            </text>
          ))}

          {/* ── Dotted note row (top) ── */}
          <text
            x={PAD_X}
            y={dottedBarY + barHeight / 2 + 4}
            fill="oklch(70% 0.02 250)"
            fontSize={11}
            fontFamily="system-ui, sans-serif"
          >
            Dotted {note.symbol}
          </text>

          {/* Original portion of dotted bar */}
          <motion.rect
            key={`orig-${selectedNote}`}
            x={GRID_LEFT}
            y={dottedBarY + 4}
            width={originalBarWidth}
            height={barHeight - 8}
            rx={4}
            fill="oklch(70% 0.15 250)"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
            style={{ originX: 0 }}
          />

          {/* Dot's addition (appended) */}
          <motion.rect
            key={`dot-${selectedNote}`}
            x={GRID_LEFT + originalBarWidth}
            y={dottedBarY + 4}
            width={dotAdditionWidth}
            height={barHeight - 8}
            rx={0}
            fill="oklch(75% 0.12 200)"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            style={{ originX: 0 }}
          />

          {/* "dot" indicator */}
          <circle
            cx={GRID_LEFT + originalBarWidth + dotAdditionWidth + 10}
            cy={dottedBarY + barHeight / 2}
            r={3}
            fill="oklch(75% 0.12 200)"
          />

          {/* Bracket showing the addition */}
          <line
            x1={GRID_LEFT + originalBarWidth}
            y1={dottedBarY + barHeight - 2}
            x2={GRID_LEFT + originalBarWidth}
            y2={dottedBarY + barHeight + 4}
            stroke="oklch(55% 0.08 200)"
            strokeWidth={1}
          />
          <text
            x={GRID_LEFT + originalBarWidth + dotAdditionWidth / 2}
            y={dottedBarY + barHeight + 12}
            textAnchor="middle"
            fill="oklch(65% 0.08 200)"
            fontSize={8}
            fontFamily="monospace"
          >
            +{addedBeats}
          </text>

          {/* ── Plain note row (bottom) ── */}
          <text
            x={PAD_X}
            y={plainBarY + barHeight / 2 + 4}
            fill="oklch(55% 0.02 250)"
            fontSize={11}
            fontFamily="system-ui, sans-serif"
          >
            Plain {note.symbol}
          </text>

          <motion.rect
            key={`plain-${selectedNote}`}
            x={GRID_LEFT}
            y={plainBarY + 4}
            width={plainBarWidth}
            height={barHeight - 8}
            rx={4}
            fill="oklch(55% 0.08 250)"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
            style={{ originX: 0 }}
          />
        </svg>
      </div>

      {/* Play controls */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => handlePlay("original")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            playing === "original"
              ? "bg-accent-400 text-surface-900"
              : "bg-surface-700 text-text-secondary hover:bg-surface-600"
          }`}
        >
          {playing === "original" ? "Playing..." : "Play Original"}
        </button>
        <button
          onClick={() => handlePlay("dotted")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            playing === "dotted"
              ? "bg-accent-400 text-surface-900"
              : "bg-surface-700 text-text-secondary hover:bg-surface-600"
          }`}
        >
          {playing === "dotted" ? "Playing..." : "Play Dotted"}
        </button>
        <button
          onClick={() => handlePlay("compare")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            playing === "compare"
              ? "bg-accent-400 text-surface-900"
              : "bg-accent-500/20 text-accent-400 hover:bg-accent-500/30"
          }`}
        >
          {playing === "compare" ? "Comparing..." : "Compare"}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs text-text-muted">BPM</label>
          <input
            type="range"
            min={40}
            max={240}
            step={1}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-surface-600 accent-accent-400"
          />
          <span className="w-8 font-mono text-xs text-text-secondary">{bpm}</span>
        </div>
      </div>

      <p className="mt-2 text-[10px] text-text-muted/60">
        A dot adds half the original value. Compare to hear the difference.
      </p>
    </div>
  );
}
