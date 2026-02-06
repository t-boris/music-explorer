"use client";

import { useCallback, useRef, useState } from "react";

// ─── Preset data ───

interface TiePreset {
  label: string;
  noteA: { name: string; symbol: string; beats: number };
  noteB: { name: string; symbol: string; beats: number };
  equivalent?: string;
}

const PRESETS: Record<string, TiePreset> = {
  "quarter-quarter": {
    label: "♩ + ♩",
    noteA: { name: "Quarter", symbol: "♩", beats: 1 },
    noteB: { name: "Quarter", symbol: "♩", beats: 1 },
    equivalent: "same as half note",
  },
  "half-quarter": {
    label: "𝅗𝅥 + ♩",
    noteA: { name: "Half", symbol: "𝅗𝅥", beats: 2 },
    noteB: { name: "Quarter", symbol: "♩", beats: 1 },
    equivalent: "same as dotted half",
  },
  "half-half": {
    label: "𝅗𝅥 + 𝅗𝅥",
    noteA: { name: "Half", symbol: "𝅗𝅥", beats: 2 },
    noteB: { name: "Half", symbol: "𝅗𝅥", beats: 2 },
    equivalent: "same as whole note",
  },
  "quarter-eighth": {
    label: "♩ + ♪",
    noteA: { name: "Quarter", symbol: "♩", beats: 1 },
    noteB: { name: "Eighth", symbol: "♪", beats: 0.5 },
    equivalent: "same as dotted quarter",
  },
};

// ─── SVG Layout ───

const PAD_X = 16;
const PAD_Y = 20;
const BEAT_UNIT = 50;
const BAR_HEIGHT = 20;
const NOTE_Y = PAD_Y;
const BAR_Y = NOTE_Y + 46;
const COMBINED_BAR_Y = BAR_Y + BAR_HEIGHT + 20;
const GRID_LEFT = 60;
const MAX_BEATS = 5;
const SVG_WIDTH = GRID_LEFT + MAX_BEATS * BEAT_UNIT + PAD_X + 10;
const SVG_HEIGHT = COMBINED_BAR_Y + BAR_HEIGHT + PAD_Y + 8;

// ─── Props ───

interface TieDemoProps {
  preset?: "quarter-quarter" | "half-quarter" | "half-half" | "quarter-eighth";
}

// ─── Component ───

export function TieDemo({ preset: initialPreset = "quarter-quarter" }: TieDemoProps) {
  const [selected, setSelected] = useState<string>(initialPreset);
  const [bpm, setBpm] = useState(100);
  const [playing, setPlaying] = useState<"separate" | "tied" | "compare" | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const preset = PRESETS[selected];
  const totalBeats = preset.noteA.beats + preset.noteB.beats;

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
    (mode: "separate" | "tied" | "compare") => {
      stopAll();
      setPlaying(mode);

      if (mode === "separate") {
        const durA = playTone(0, preset.noteA.beats);
        const gap = 0.08;
        const durB = playTone(durA + gap, preset.noteB.beats);
        const totalMs = (durA + gap + durB) * 1000 + 50;
        timerRef.current.push(setTimeout(() => setPlaying(null), totalMs));
      } else if (mode === "tied") {
        const dur = playTone(0, totalBeats);
        timerRef.current.push(setTimeout(() => setPlaying(null), dur * 1000 + 50));
      } else {
        // Compare: separate, pause, then tied
        const durA = playTone(0, preset.noteA.beats);
        const gap1 = 0.08;
        const durB = playTone(durA + gap1, preset.noteB.beats);
        const pause = 0.4;
        const offset = durA + gap1 + durB + pause;
        const durTied = playTone(offset, totalBeats);
        const totalMs = (offset + durTied) * 1000 + 50;
        timerRef.current.push(setTimeout(() => setPlaying(null), totalMs));
      }
    },
    [preset, totalBeats, playTone, stopAll]
  );

  // ─── SVG drawing ───

  const barAWidth = preset.noteA.beats * BEAT_UNIT;
  const barBWidth = preset.noteB.beats * BEAT_UNIT;
  const combinedWidth = totalBeats * BEAT_UNIT;

  // Noteheads in SVG
  const noteAx = GRID_LEFT + barAWidth / 2;
  const noteBx = GRID_LEFT + barAWidth + barBWidth / 2;
  const noteHeadY = NOTE_Y + 12;

  // Tie arc control points (bezier)
  const tieCx1 = noteAx + (noteBx - noteAx) * 0.3;
  const tieCx2 = noteAx + (noteBx - noteAx) * 0.7;
  const tieCy = noteHeadY + 16;

  return (
    <div className="my-6 rounded-xl border border-surface-700 bg-surface-800 p-4">
      <h3 className="mb-3 text-sm font-semibold text-text-primary">
        Ties — Connecting Durations
      </h3>

      {/* Preset buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(PRESETS).map(([key, p]) => (
          <button
            key={key}
            onClick={() => {
              stopAll();
              setSelected(key);
            }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selected === key
                ? "bg-accent-500 text-surface-900"
                : "bg-surface-700 text-text-secondary hover:bg-surface-600"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Calculation label */}
      <div className="mb-4 flex items-center gap-3 rounded-lg bg-surface-700/50 px-4 py-2.5">
        <span className="font-mono text-lg text-accent-400">
          {preset.noteA.beats} {preset.noteA.beats === 1 ? "beat" : "beats"}
        </span>
        <span className="text-text-muted">+</span>
        <span className="font-mono text-lg text-accent-400">
          {preset.noteB.beats} {preset.noteB.beats === 1 ? "beat" : "beats"}
        </span>
        <span className="text-text-muted">=</span>
        <span className="font-mono text-lg font-bold text-text-primary">
          {totalBeats} beats
        </span>
        {preset.equivalent && (
          <span className="text-xs text-text-muted">({preset.equivalent})</span>
        )}
      </div>

      {/* SVG Visualization */}
      <div className="overflow-x-auto rounded-lg">
        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="min-w-fit"
        >
          {/* Beat grid */}
          {Array.from({ length: MAX_BEATS + 1 }, (_, i) => (
            <line
              key={`grid-${i}`}
              x1={GRID_LEFT + i * BEAT_UNIT}
              y1={NOTE_Y}
              x2={GRID_LEFT + i * BEAT_UNIT}
              y2={COMBINED_BAR_Y + BAR_HEIGHT + 6}
              stroke="oklch(35% 0.02 250)"
              strokeWidth={0.5}
              strokeDasharray="3 3"
            />
          ))}

          {/* Beat numbers */}
          {Array.from({ length: MAX_BEATS }, (_, i) => (
            <text
              key={`bn-${i}`}
              x={GRID_LEFT + i * BEAT_UNIT + BEAT_UNIT / 2}
              y={SVG_HEIGHT - 2}
              textAnchor="middle"
              fill="oklch(40% 0.02 250)"
              fontSize={9}
              fontFamily="monospace"
            >
              {i + 1}
            </text>
          ))}

          {/* ── Note heads with tie arc ── */}
          {/* Note A head (filled oval) */}
          <ellipse cx={noteAx} cy={noteHeadY} rx={7} ry={5} fill="oklch(70% 0.15 250)" />
          {/* Note A stem */}
          <line x1={noteAx + 7} y1={noteHeadY} x2={noteAx + 7} y2={noteHeadY - 20} stroke="oklch(70% 0.15 250)" strokeWidth={1.5} />

          {/* Note B head (filled oval) */}
          <ellipse cx={noteBx} cy={noteHeadY} rx={7} ry={5} fill="oklch(70% 0.15 250)" />
          {/* Note B stem */}
          <line x1={noteBx + 7} y1={noteHeadY} x2={noteBx + 7} y2={noteHeadY - 20} stroke="oklch(70% 0.15 250)" strokeWidth={1.5} />

          {/* Tie arc (curved line below noteheads) */}
          <path
            d={`M ${noteAx} ${noteHeadY + 5} C ${tieCx1} ${tieCy}, ${tieCx2} ${tieCy}, ${noteBx} ${noteHeadY + 5}`}
            fill="none"
            stroke="oklch(70% 0.12 250)"
            strokeWidth={1.5}
          />

          {/* ── Individual duration bars ── */}
          <text x={PAD_X} y={BAR_Y + BAR_HEIGHT / 2 + 4} fill="oklch(55% 0.02 250)" fontSize={9} fontFamily="system-ui">
            Separate
          </text>

          <rect
            x={GRID_LEFT}
            y={BAR_Y + 2}
            width={barAWidth - 2}
            height={BAR_HEIGHT - 4}
            rx={3}
            fill="oklch(65% 0.12 250)"
          />
          <rect
            x={GRID_LEFT + barAWidth + 2}
            y={BAR_Y + 2}
            width={barBWidth - 2}
            height={BAR_HEIGHT - 4}
            rx={3}
            fill="oklch(65% 0.12 200)"
          />

          {/* ── Combined bar (tied) ── */}
          <text x={PAD_X} y={COMBINED_BAR_Y + BAR_HEIGHT / 2 + 4} fill="oklch(55% 0.02 250)" fontSize={9} fontFamily="system-ui">
            Tied
          </text>

          <rect
            x={GRID_LEFT}
            y={COMBINED_BAR_Y + 2}
            width={combinedWidth}
            height={BAR_HEIGHT - 4}
            rx={3}
            fill="oklch(70% 0.15 170)"
          />
        </svg>
      </div>

      {/* Play controls */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => handlePlay("separate")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            playing === "separate"
              ? "bg-accent-400 text-surface-900"
              : "bg-surface-700 text-text-secondary hover:bg-surface-600"
          }`}
        >
          {playing === "separate" ? "Playing..." : "Play Separate"}
        </button>
        <button
          onClick={() => handlePlay("tied")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            playing === "tied"
              ? "bg-accent-400 text-surface-900"
              : "bg-surface-700 text-text-secondary hover:bg-surface-600"
          }`}
        >
          {playing === "tied" ? "Playing..." : "Play Tied"}
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
        A tie sustains one note for the combined duration — only the first note is attacked.
      </p>
    </div>
  );
}
