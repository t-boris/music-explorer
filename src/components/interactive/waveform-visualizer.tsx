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

// ─── Types ───

type WaveformType = "sine" | "square" | "sawtooth" | "triangle";

interface WaveformVisualizerProps {
  defaultFrequency?: number;
  defaultAmplitude?: number;
  defaultWaveform?: WaveformType;
  showControls?: boolean;
  width?: number;
  height?: number;
}

// ─── Static Waveform Drawing ───

function drawStaticWaveform(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  waveform: WaveformType,
  frequency: number,
  amplitude: number
) {
  // Background
  ctx.fillStyle = "oklch(20% 0.01 250)";
  ctx.fillRect(0, 0, w, h);

  // Grid
  drawGrid(ctx, w, h);

  // Draw waveform mathematically
  ctx.beginPath();
  ctx.strokeStyle = "oklch(75% 0.15 65)";
  ctx.lineWidth = 2;

  const cycles = Math.max(2, Math.min(8, frequency / 100));
  const mid = h / 2;
  const amp = (h / 2 - 10) * amplitude;

  for (let x = 0; x < w; x++) {
    const t = (x / w) * cycles * 2 * Math.PI;
    let y: number;

    switch (waveform) {
      case "sine":
        y = Math.sin(t);
        break;
      case "square":
        y = Math.sin(t) >= 0 ? 1 : -1;
        break;
      case "sawtooth":
        y = 2 * ((t / (2 * Math.PI)) % 1) - 1;
        break;
      case "triangle":
        y = 2 * Math.abs(2 * ((t / (2 * Math.PI)) % 1) - 1) - 1;
        break;
    }

    const py = mid - y * amp;
    if (x === 0) ctx.moveTo(x, py);
    else ctx.lineTo(x, py);
  }
  ctx.stroke();
}

function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.strokeStyle = "oklch(25% 0.015 250)";
  ctx.lineWidth = 1;

  // Horizontal lines
  for (let i = 1; i < 4; i++) {
    const y = (h / 4) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Vertical lines
  for (let i = 1; i < 8; i++) {
    const x = (w / 8) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  // Center line (brighter)
  ctx.strokeStyle = "oklch(30% 0.015 250)";
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();
}

// ─── Component ───

export function WaveformVisualizer({
  defaultFrequency = 440,
  defaultAmplitude = 0.5,
  defaultWaveform = "sine",
  showControls = true,
  width = 600,
  height = 200,
}: WaveformVisualizerProps) {
  const [frequency, setFrequency] = useState(defaultFrequency);
  const [amplitude, setAmplitude] = useState(defaultAmplitude);
  const [waveform, setWaveform] = useState<WaveformType>(defaultWaveform);
  const [isPlaying, setIsPlaying] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);

  // ─── Draw live waveform from analyser data ───
  const drawLiveWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    // Background
    ctx.fillStyle = "oklch(20% 0.01 250)";
    ctx.fillRect(0, 0, w, h);

    // Grid
    drawGrid(ctx, w, h);

    // Waveform
    ctx.beginPath();
    ctx.strokeStyle = "oklch(75% 0.15 65)";
    ctx.lineWidth = 2;

    const sliceWidth = w / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * h) / 2;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);

      x += sliceWidth;
    }

    ctx.lineTo(w, h / 2);
    ctx.stroke();

    animFrameRef.current = requestAnimationFrame(drawLiveWaveform);
  }, []);

  // ─── Draw static waveform ───
  const drawStatic = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawStaticWaveform(ctx, canvas.width, canvas.height, waveform, frequency, amplitude);
  }, [waveform, frequency, amplitude]);

  // ─── Play / Stop ───
  const play = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const analyser = ctx.createAnalyser();

    osc.type = waveform;
    osc.frequency.value = frequency;
    gain.gain.value = amplitude;
    analyser.fftSize = 2048;

    osc.connect(gain);
    gain.connect(analyser);
    analyser.connect(ctx.destination);

    osc.start();

    oscRef.current = osc;
    gainRef.current = gain;
    analyserRef.current = analyser;
    setIsPlaying(true);

    // Start drawing
    animFrameRef.current = requestAnimationFrame(drawLiveWaveform);
  }, [waveform, frequency, amplitude, drawLiveWaveform]);

  const stop = useCallback(() => {
    if (oscRef.current) {
      oscRef.current.stop();
      oscRef.current.disconnect();
      oscRef.current = null;
    }
    if (gainRef.current) {
      gainRef.current.disconnect();
      gainRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    cancelAnimationFrame(animFrameRef.current);
    setIsPlaying(false);
  }, []);

  // ─── Update live audio params ───
  useEffect(() => {
    if (oscRef.current) {
      oscRef.current.frequency.value = frequency;
    }
  }, [frequency]);

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = amplitude;
    }
  }, [amplitude]);

  useEffect(() => {
    if (oscRef.current) {
      oscRef.current.type = waveform;
    }
  }, [waveform]);

  // ─── Draw static when not playing ───
  useEffect(() => {
    if (!isPlaying) {
      drawStatic();
    }
  }, [isPlaying, drawStatic]);

  // ─── Cleanup ───
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // ─── Frequency slider (logarithmic) ───
  const freqToSlider = (f: number) =>
    ((Math.log2(f) - Math.log2(20)) / (Math.log2(2000) - Math.log2(20))) * 100;
  const sliderToFreq = (v: number) =>
    20 * Math.pow(2, (v / 100) * (Math.log2(2000) - Math.log2(20)));

  const waveforms: WaveformType[] = ["sine", "square", "sawtooth", "triangle"];

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-surface-700 bg-surface-800">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full"
        style={{ maxWidth: width }}
      />

      {showControls && (
        <div className="flex flex-col gap-3 p-4">
          {/* Play/Stop + Frequency display */}
          <div className="flex items-center gap-3">
            <button
              onClick={isPlaying ? stop : play}
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
            <span className="font-mono text-sm text-text-secondary">
              {Math.round(frequency)} Hz — {frequencyToNoteName(frequency)}
            </span>
          </div>

          {/* Frequency slider */}
          <div className="flex items-center gap-3">
            <label className="w-20 text-xs text-text-muted">Frequency</label>
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={freqToSlider(frequency)}
              onChange={(e) => setFrequency(Math.round(sliderToFreq(Number(e.target.value))))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-surface-600 accent-accent-400"
            />
          </div>

          {/* Amplitude slider */}
          <div className="flex items-center gap-3">
            <label className="w-20 text-xs text-text-muted">Amplitude</label>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={amplitude * 100}
              onChange={(e) => setAmplitude(Number(e.target.value) / 100)}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-surface-600 accent-accent-400"
            />
          </div>

          {/* Waveform selector */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="w-20 text-xs text-text-muted">Waveform</label>
            {waveforms.map((w) => (
              <button
                key={w}
                onClick={() => setWaveform(w)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  waveform === w
                    ? "bg-accent-400 text-surface-900"
                    : "bg-surface-700 text-text-secondary hover:bg-surface-600"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
