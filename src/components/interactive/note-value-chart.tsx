"use client";

import { useCallback, useRef, useState } from "react";

// ─── Data ───

interface NoteRow {
  name: string;
  symbol: string;
  beats: number;
  color: string;
  colorBg: string;
}

const NOTE_ROWS: NoteRow[] = [
  { name: "Whole", symbol: "𝅝", beats: 4, color: "oklch(80% 0.14 85)", colorBg: "oklch(80% 0.14 85 / 0.2)" },
  { name: "Half", symbol: "𝅗𝅥", beats: 2, color: "oklch(75% 0.14 145)", colorBg: "oklch(75% 0.14 145 / 0.2)" },
  { name: "Quarter", symbol: "♩", beats: 1, color: "oklch(70% 0.14 180)", colorBg: "oklch(70% 0.14 180 / 0.2)" },
  { name: "Eighth", symbol: "♪", beats: 0.5, color: "oklch(65% 0.14 240)", colorBg: "oklch(65% 0.14 240 / 0.2)" },
  { name: "Sixteenth", symbol: "♬", beats: 0.25, color: "oklch(65% 0.14 300)", colorBg: "oklch(65% 0.14 300 / 0.2)" },
];

const REST_ROWS: NoteRow[] = [
  { name: "Whole rest", symbol: "𝄻", beats: 4, color: "oklch(80% 0.14 85)", colorBg: "oklch(80% 0.14 85 / 0.2)" },
  { name: "Half rest", symbol: "𝄼", beats: 2, color: "oklch(75% 0.14 145)", colorBg: "oklch(75% 0.14 145 / 0.2)" },
  { name: "Quarter rest", symbol: "𝄽", beats: 1, color: "oklch(70% 0.14 180)", colorBg: "oklch(70% 0.14 180 / 0.2)" },
  { name: "Eighth rest", symbol: "𝄾", beats: 0.5, color: "oklch(65% 0.14 240)", colorBg: "oklch(65% 0.14 240 / 0.2)" },
  { name: "16th rest", symbol: "𝄿", beats: 0.25, color: "oklch(65% 0.14 300)", colorBg: "oklch(65% 0.14 300 / 0.2)" },
];

// ─── Layout constants ───

const ROW_HEIGHT = 36;
const ROW_GAP = 6;
const LABEL_WIDTH = 100;
const SYMBOL_WIDTH = 28;
const BAR_MAX_WIDTH = 200;
const BEAT_LABEL_WIDTH = 60;
const PAD_X = 12;
const PAD_Y = 8;

const SVG_WIDTH = PAD_X + LABEL_WIDTH + SYMBOL_WIDTH + BAR_MAX_WIDTH + BEAT_LABEL_WIDTH + PAD_X;
const SVG_HEIGHT = PAD_Y + NOTE_ROWS.length * (ROW_HEIGHT + ROW_GAP) - ROW_GAP + PAD_Y;

// ─── Props ───

interface NoteValueChartProps {
  mode?: "notes" | "rests";
}

// ─── Component ───

export function NoteValueChart({ mode = "notes" }: NoteValueChartProps) {
  const rows = mode === "rests" ? REST_ROWS : NOTE_ROWS;
  const isRest = mode === "rests";

  const [bpm, setBpm] = useState(100);
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const stopCurrent = useCallback(() => {
    if (activeSourceRef.current) {
      const { osc, gain } = activeSourceRef.current;
      const ctx = audioCtxRef.current;
      if (ctx) {
        gain.gain.cancelScheduledValues(ctx.currentTime);
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.02);
        osc.stop(ctx.currentTime + 0.03);
      }
      activeSourceRef.current = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setActiveRow(null);
  }, []);

  const playRow = useCallback(
    (index: number) => {
      if (isRest) return; // rests are silence — no playback

      stopCurrent();
      const ctx = getAudioContext();
      const row = rows[index];
      const durationSec = (row.beats * 60) / bpm;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 440;

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
      gain.gain.setValueAtTime(0.3, now + durationSec - 0.05);
      gain.gain.linearRampToValueAtTime(0, now + durationSec);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + durationSec + 0.01);

      activeSourceRef.current = { osc, gain };
      setActiveRow(index);

      timerRef.current = setTimeout(() => {
        setActiveRow(null);
        activeSourceRef.current = null;
      }, durationSec * 1000);
    },
    [rows, bpm, isRest, stopCurrent, getAudioContext]
  );

  const barX = PAD_X + LABEL_WIDTH + SYMBOL_WIDTH;

  return (
    <div className="my-6 rounded-xl border border-surface-700 bg-surface-800 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">
          {isRest ? "Rest Values" : "Note Values"} — Proportional Durations
        </h3>
      </div>

      <div className="overflow-x-auto">
        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="min-w-fit"
        >
          {rows.map((row, i) => {
            const y = PAD_Y + i * (ROW_HEIGHT + ROW_GAP);
            const barWidth = (row.beats / 4) * BAR_MAX_WIDTH;
            const isActive = activeRow === i;

            return (
              <g
                key={row.name}
                onClick={() => playRow(i)}
                style={{ cursor: isRest ? "default" : "pointer" }}
              >
                {/* Row hover background */}
                <rect
                  x={PAD_X - 4}
                  y={y}
                  width={SVG_WIDTH - 2 * PAD_X + 8}
                  height={ROW_HEIGHT}
                  rx={6}
                  fill={isActive ? row.colorBg : "transparent"}
                />

                {/* Note/Rest name */}
                <text
                  x={PAD_X}
                  y={y + ROW_HEIGHT / 2 + 4}
                  fill="oklch(70% 0.02 250)"
                  fontSize={12}
                  fontFamily="system-ui, sans-serif"
                >
                  {row.name}
                </text>

                {/* Symbol */}
                <text
                  x={PAD_X + LABEL_WIDTH}
                  y={y + ROW_HEIGHT / 2 + 5}
                  fill={row.color}
                  fontSize={16}
                  textAnchor="middle"
                >
                  {row.symbol}
                </text>

                {/* Duration bar */}
                <rect
                  x={barX}
                  y={y + (ROW_HEIGHT - 16) / 2}
                  width={barWidth}
                  height={16}
                  rx={4}
                  fill={isActive ? row.color : row.color}
                  opacity={isActive ? 1 : 0.7}
                  strokeDasharray={isRest ? "4 3" : "none"}
                  stroke={isRest ? row.color : "none"}
                  strokeWidth={isRest ? 1.5 : 0}
                  fillOpacity={isRest ? 0.15 : undefined}
                />

                {/* Beat grid markers */}
                {Array.from({ length: 4 }, (_, bi) => (
                  <line
                    key={bi}
                    x1={barX + (bi / 4) * BAR_MAX_WIDTH}
                    y1={y + 4}
                    x2={barX + (bi / 4) * BAR_MAX_WIDTH}
                    y2={y + ROW_HEIGHT - 4}
                    stroke="oklch(40% 0.02 250)"
                    strokeWidth={0.5}
                    strokeDasharray="2 2"
                  />
                ))}

                {/* Beat count label */}
                <text
                  x={barX + BAR_MAX_WIDTH + 12}
                  y={y + ROW_HEIGHT / 2 + 4}
                  fill={row.color}
                  fontSize={12}
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {row.beats >= 1
                    ? `${row.beats} beat${row.beats !== 1 ? "s" : ""}`
                    : `1/${1 / row.beats} beat`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Controls */}
      {!isRest && (
        <div className="mt-3 flex items-center gap-4">
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
          <span className="text-[10px] text-text-muted/60">
            Click a row to hear its duration
          </span>
        </div>
      )}

      {isRest && (
        <p className="mt-3 text-[10px] text-text-muted/60">
          Rests are measured silence — dashed outlines show relative duration.
        </p>
      )}
    </div>
  );
}
