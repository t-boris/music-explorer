"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Presets ───

interface RhythmPreset {
  name: string;
  pattern: number[];
  beatsPerMeasure: number;
  subdivisions: number;
}

const PRESETS: RhythmPreset[] = [
  {
    name: "Basic Rock",
    pattern: [1, 0, 1, 0, 1, 0, 1, 0],
    beatsPerMeasure: 4,
    subdivisions: 2,
  },
  {
    name: "Backbeat",
    pattern: [1, 0, 0, 0, 1, 0, 0, 0],
    beatsPerMeasure: 4,
    subdivisions: 2,
  },
  {
    name: "Swing",
    pattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
    beatsPerMeasure: 4,
    subdivisions: 3,
  },
  {
    name: "Waltz",
    pattern: [1, 0, 1, 0, 1, 0],
    beatsPerMeasure: 3,
    subdivisions: 2,
  },
  {
    name: "Bossa Nova",
    pattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0],
    beatsPerMeasure: 4,
    subdivisions: 4,
  },
];

// ─── Types ───

interface RhythmVisualizerProps {
  pattern?: number[];
  beatsPerMeasure?: number;
  subdivisions?: number;
  bpm?: number;
}

// ─── Component ───

export function RhythmVisualizer({
  pattern: initialPattern,
  beatsPerMeasure: initialBeats = 4,
  subdivisions: initialSubs = 2,
  bpm: initialBpm = 100,
}: RhythmVisualizerProps) {
  const defaultPattern = initialPattern ??
    Array.from({ length: initialBeats * initialSubs }, (_, i) =>
      i % initialSubs === 0 ? 1 : 0
    );

  const [pattern, setPattern] = useState<number[]>(defaultPattern);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(initialBeats);
  const [subdivisions, setSubdivisions] = useState(initialSubs);
  const [bpm, setBpm] = useState(initialBpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentStepRef = useRef(0);
  const patternRef = useRef(pattern);
  const bpmRef = useRef(bpm);
  const subdivisionsRef = useRef(subdivisions);

  // Keep refs in sync
  useEffect(() => {
    patternRef.current = pattern;
  }, [pattern]);
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);
  useEffect(() => {
    subdivisionsRef.current = subdivisions;
  }, [subdivisions]);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // ─── Schedule a click sound ───
  const scheduleClick = useCallback(
    (time: number, step: number) => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const pat = patternRef.current;
      if (!pat[step]) return; // rest — no sound

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Downbeat gets higher pitch
      const isDownbeat = step % subdivisionsRef.current === 0;
      osc.frequency.value = isDownbeat ? 1000 : 800;
      osc.type = "sine";

      const attackTime = 0.001;
      const decayTime = 0.04;

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.6, time + attackTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        time + attackTime + decayTime
      );

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + attackTime + decayTime + 0.01);
    },
    []
  );

  // ─── Advance to next step ───
  const advanceStep = useCallback(() => {
    const secondsPerSubdivision =
      60.0 / bpmRef.current / subdivisionsRef.current;
    nextNoteTimeRef.current += secondsPerSubdivision;

    currentStepRef.current =
      (currentStepRef.current + 1) % patternRef.current.length;
    setCurrentStep(currentStepRef.current);
  }, []);

  // ─── Look-ahead scheduler ───
  const scheduler = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    while (nextNoteTimeRef.current < ctx.currentTime + 0.1) {
      scheduleClick(nextNoteTimeRef.current, currentStepRef.current);
      advanceStep();
    }
  }, [scheduleClick, advanceStep]);

  // ─── Play/Stop ───
  const start = useCallback(() => {
    if (isPlaying) return;
    const ctx = getAudioContext();

    currentStepRef.current = 0;
    setCurrentStep(0);
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
    setCurrentStep(-1);
    currentStepRef.current = 0;
  }, [isPlaying]);

  // ─── Toggle a step ───
  const toggleStep = (index: number) => {
    setPattern((prev) => {
      const next = [...prev];
      next[index] = next[index] ? 0 : 1;
      return next;
    });
  };

  // ─── Apply preset ───
  const applyPreset = (preset: RhythmPreset) => {
    stop();
    setPattern(preset.pattern);
    setBeatsPerMeasure(preset.beatsPerMeasure);
    setSubdivisions(preset.subdivisions);
  };

  // ─── Cleanup ───
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

  // ─── Resize pattern when beats/subdivisions change ───
  useEffect(() => {
    const newLength = beatsPerMeasure * subdivisions;
    setPattern((prev) => {
      if (prev.length === newLength) return prev;
      const next = Array.from({ length: newLength }, (_, i) =>
        i < prev.length ? prev[i] : 0
      );
      return next;
    });
  }, [beatsPerMeasure, subdivisions]);

  const totalSteps = pattern.length;

  return (
    <div className="my-6 rounded-xl border border-surface-700 bg-surface-800 p-4">
      {/* Presets */}
      <div className="mb-3 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => applyPreset(p)}
            className="rounded-full bg-accent-500/20 px-3 py-1 text-xs font-medium text-accent-400 transition-colors hover:bg-accent-500/30"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Beat grid */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {pattern.map((hit, i) => {
          const isDownbeat = i % subdivisions === 0;
          const isCurrent = i === currentStep;
          const beatBoundary = i > 0 && i % subdivisions === 0;

          return (
            <div key={i} className="flex items-center">
              {beatBoundary && (
                <div className="mx-1 h-6 w-px bg-surface-600" />
              )}
              <button
                onClick={() => toggleStep(i)}
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                  hit
                    ? isCurrent
                      ? "animate-pulse border-accent-400 bg-accent-400 text-surface-900 ring-2 ring-accent-400/50"
                      : "border-accent-400 bg-accent-400 text-surface-900"
                    : isCurrent
                    ? "border-accent-400/50 bg-surface-700 text-text-muted ring-2 ring-accent-400/30"
                    : "border-surface-600 bg-surface-700 text-text-muted hover:border-surface-500"
                } ${isDownbeat && !hit ? "border-surface-500" : ""}`}
                aria-label={`Step ${i + 1}: ${hit ? "hit" : "rest"}`}
              >
                {isDownbeat ? i / subdivisions + 1 : ""}
              </button>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Play/Stop */}
        <button
          onClick={isPlaying ? stop : start}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500 text-surface-900 transition-colors hover:bg-accent-400"
          aria-label={isPlaying ? "Stop" : "Play"}
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <rect x="1" y="1" width="4" height="12" rx="1" />
              <rect x="9" y="1" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
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

        {/* Info */}
        <span className="text-xs text-text-muted">
          {beatsPerMeasure}/{subdivisions === 2 ? 4 : subdivisions === 3 ? 8 : 16}{" "}
          &middot; {totalSteps} steps
        </span>
      </div>
    </div>
  );
}
