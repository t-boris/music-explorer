"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Helpers ───

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

function frequencyToNoteName(freq: number): string {
  if (freq <= 0) return "";
  const semitones = 12 * Math.log2(freq / 440);
  const midi = Math.round(semitones + 69);
  const noteName = NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${noteName}${octave}`;
}

function gcd(a: number, b: number): number {
  a = Math.round(a);
  b = Math.round(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

function simplifyRatio(
  a: number,
  b: number
): { num: number; den: number } {
  // Find approximate simple ratio
  const ratio = a / b;
  let bestNum = 1;
  let bestDen = 1;
  let bestError = Infinity;

  for (let den = 1; den <= 12; den++) {
    const num = Math.round(ratio * den);
    if (num < 1 || num > 24) continue;
    const error = Math.abs(num / den - ratio);
    if (error < bestError) {
      bestError = error;
      bestNum = num;
      bestDen = den;
    }
  }

  const d = gcd(bestNum, bestDen);
  return { num: bestNum / d, den: bestDen / d };
}

// ─── Presets ───

interface Preset {
  label: string;
  ratio: [number, number]; // [numerator, denominator]
}

const PRESETS: Preset[] = [
  { label: "Unison (1:1)", ratio: [1, 1] },
  { label: "Octave (2:1)", ratio: [2, 1] },
  { label: "Fifth (3:2)", ratio: [3, 2] },
  { label: "Fourth (4:3)", ratio: [4, 3] },
  { label: "Major Third (5:4)", ratio: [5, 4] },
];

// ─── Waveform Canvas ───

function drawMathWaveform(
  canvas: HTMLCanvasElement,
  frequency: number,
  color: string
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = "oklch(20% 0.01 250)";
  ctx.fillRect(0, 0, w, h);

  // Grid center line
  ctx.strokeStyle = "oklch(25% 0.015 250)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();

  // Waveform
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  const cycles = Math.max(2, Math.min(8, frequency / 100));
  const mid = h / 2;
  const amp = h / 2 - 4;

  for (let x = 0; x < w; x++) {
    const t = (x / w) * cycles * 2 * Math.PI;
    const y = mid - Math.sin(t) * amp;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

// ─── Oscillator Control ───

function OscillatorControl({
  label,
  frequency,
  onFrequencyChange,
  isPlaying,
  onTogglePlay,
  color,
}: {
  label: string;
  frequency: number;
  onFrequencyChange: (f: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  color: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawMathWaveform(canvasRef.current, frequency, color);
    }
  }, [frequency, color]);

  const freqToSlider = (f: number) =>
    ((Math.log2(f) - Math.log2(20)) / (Math.log2(2000) - Math.log2(20))) * 100;
  const sliderToFreq = (v: number) =>
    20 * Math.pow(2, (v / 100) * (Math.log2(2000) - Math.log2(20)));

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-muted">{label}</span>
        <span className="font-mono text-xs text-text-secondary">
          {Math.round(frequency)} Hz — {frequencyToNoteName(frequency)}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={280}
        height={60}
        className="w-full rounded-lg border border-surface-700"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePlay}
          className={`flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors ${
            isPlaying
              ? "bg-accent-400 text-surface-900"
              : "bg-surface-700 text-text-secondary hover:bg-surface-600"
          }`}
          aria-label={isPlaying ? "Stop" : "Play"}
        >
          {isPlaying ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <rect x="1" y="1" width="3" height="8" rx="0.5" />
              <rect x="6" y="1" width="3" height="8" rx="0.5" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <polygon points="2,0 10,5 2,10" />
            </svg>
          )}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={freqToSlider(frequency)}
          onChange={(e) =>
            onFrequencyChange(Math.round(sliderToFreq(Number(e.target.value))))
          }
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-surface-600 accent-accent-400"
        />
      </div>
    </div>
  );
}

// ─── Main Component ───

export function FrequencyExplorer() {
  const [freq1, setFreq1] = useState(440);
  const [freq2, setFreq2] = useState(660);
  const [playing1, setPlaying1] = useState(false);
  const [playing2, setPlaying2] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gain1Ref = useRef<GainNode | null>(null);
  const gain2Ref = useRef<GainNode | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // ─── Play/Stop individual oscillators ───
  const startOsc = useCallback(
    (
      freq: number,
      oscRef: React.MutableRefObject<OscillatorNode | null>,
      gainRef: React.MutableRefObject<GainNode | null>
    ) => {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.value = 0.3;

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscRef.current = osc;
      gainRef.current = gain;
    },
    [getAudioContext]
  );

  const stopOsc = useCallback(
    (
      oscRef: React.MutableRefObject<OscillatorNode | null>,
      gainRef: React.MutableRefObject<GainNode | null>
    ) => {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      if (gainRef.current) {
        gainRef.current.disconnect();
        gainRef.current = null;
      }
    },
    []
  );

  const togglePlay1 = useCallback(() => {
    if (playing1) {
      stopOsc(osc1Ref, gain1Ref);
      setPlaying1(false);
    } else {
      startOsc(freq1, osc1Ref, gain1Ref);
      setPlaying1(true);
    }
  }, [playing1, freq1, startOsc, stopOsc]);

  const togglePlay2 = useCallback(() => {
    if (playing2) {
      stopOsc(osc2Ref, gain2Ref);
      setPlaying2(false);
    } else {
      startOsc(freq2, osc2Ref, gain2Ref);
      setPlaying2(true);
    }
  }, [playing2, freq2, startOsc, stopOsc]);

  // ─── Hear Together ───
  const playBoth = useCallback(() => {
    if (!playing1) {
      startOsc(freq1, osc1Ref, gain1Ref);
      setPlaying1(true);
    }
    if (!playing2) {
      startOsc(freq2, osc2Ref, gain2Ref);
      setPlaying2(true);
    }
  }, [playing1, playing2, freq1, freq2, startOsc]);

  const stopBoth = useCallback(() => {
    stopOsc(osc1Ref, gain1Ref);
    stopOsc(osc2Ref, gain2Ref);
    setPlaying1(false);
    setPlaying2(false);
  }, [stopOsc]);

  // ─── Update live freq ───
  useEffect(() => {
    if (osc1Ref.current) osc1Ref.current.frequency.value = freq1;
  }, [freq1]);

  useEffect(() => {
    if (osc2Ref.current) osc2Ref.current.frequency.value = freq2;
  }, [freq2]);

  // ─── Cleanup ───
  useEffect(() => {
    return () => {
      if (osc1Ref.current) {
        osc1Ref.current.stop();
        osc1Ref.current.disconnect();
      }
      if (osc2Ref.current) {
        osc2Ref.current.stop();
        osc2Ref.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // ─── Ratio ───
  const higher = Math.max(freq1, freq2);
  const lower = Math.min(freq1, freq2);
  const { num, den } = simplifyRatio(higher, lower);

  // ─── Apply preset ───
  const applyPreset = (preset: Preset) => {
    stopBoth();
    const base = 440;
    setFreq1(base);
    setFreq2(Math.round((base * preset.ratio[0]) / preset.ratio[1]));
  };

  return (
    <div className="my-6 rounded-xl border border-surface-700 bg-surface-800 p-4">
      {/* Presets */}
      <div className="mb-4 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p)}
            className="rounded-full bg-accent-500/20 px-3 py-1 text-xs font-medium text-accent-400 transition-colors hover:bg-accent-500/30"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Two oscillators */}
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        <OscillatorControl
          label="Oscillator A"
          frequency={freq1}
          onFrequencyChange={setFreq1}
          isPlaying={playing1}
          onTogglePlay={togglePlay1}
          color="oklch(75% 0.15 65)"
        />
        <OscillatorControl
          label="Oscillator B"
          frequency={freq2}
          onFrequencyChange={setFreq2}
          isPlaying={playing2}
          onTogglePlay={togglePlay2}
          color="oklch(65% 0.15 160)"
        />
      </div>

      {/* Ratio + Hear Together */}
      <div className="mt-4 flex items-center justify-between border-t border-surface-700 pt-3">
        <div className="font-mono text-sm text-text-secondary">
          Ratio: <span className="text-accent-400">{num}:{den}</span>
        </div>
        <button
          onClick={playing1 && playing2 ? stopBoth : playBoth}
          className="rounded-lg bg-accent-500 px-4 py-1.5 text-xs font-medium text-surface-900 transition-colors hover:bg-accent-400"
        >
          {playing1 && playing2 ? "Stop Both" : "Hear Together"}
        </button>
      </div>
    </div>
  );
}
