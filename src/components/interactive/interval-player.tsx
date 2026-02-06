"use client";

import { useCallback, useRef, useState } from "react";

// ─── Note/Frequency Helpers ───

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

const ROOT_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function noteNameToMidi(note: string): number {
  const match = note.match(/^([A-G]#?)(\d+)$/);
  if (!match) return 60; // default C4
  const name = match[1];
  const octave = parseInt(match[2], 10);
  const noteIndex = NOTE_NAMES.indexOf(name);
  if (noteIndex === -1) return 60;
  return (octave + 1) * 12 + noteIndex;
}

function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// ─── Interval Data ───

type ConsonanceLevel = "consonant" | "mild" | "dissonant";

interface IntervalInfo {
  name: string;
  abbreviation: string;
  semitones: number;
  ratio: string;
  consonance: ConsonanceLevel;
}

const INTERVALS: IntervalInfo[] = [
  { name: "Perfect Unison", abbreviation: "P1", semitones: 0, ratio: "1:1", consonance: "consonant" },
  { name: "Minor Second", abbreviation: "m2", semitones: 1, ratio: "16:15", consonance: "dissonant" },
  { name: "Major Second", abbreviation: "M2", semitones: 2, ratio: "9:8", consonance: "mild" },
  { name: "Minor Third", abbreviation: "m3", semitones: 3, ratio: "6:5", consonance: "consonant" },
  { name: "Major Third", abbreviation: "M3", semitones: 4, ratio: "5:4", consonance: "consonant" },
  { name: "Perfect Fourth", abbreviation: "P4", semitones: 5, ratio: "4:3", consonance: "consonant" },
  { name: "Tritone", abbreviation: "TT", semitones: 6, ratio: "45:32", consonance: "dissonant" },
  { name: "Perfect Fifth", abbreviation: "P5", semitones: 7, ratio: "3:2", consonance: "consonant" },
  { name: "Minor Sixth", abbreviation: "m6", semitones: 8, ratio: "8:5", consonance: "mild" },
  { name: "Major Sixth", abbreviation: "M6", semitones: 9, ratio: "5:3", consonance: "consonant" },
  { name: "Minor Seventh", abbreviation: "m7", semitones: 10, ratio: "9:5", consonance: "mild" },
  { name: "Major Seventh", abbreviation: "M7", semitones: 11, ratio: "15:8", consonance: "dissonant" },
  { name: "Perfect Octave", abbreviation: "P8", semitones: 12, ratio: "2:1", consonance: "consonant" },
];

// ─── Types ───

type PlayMode = "ascending" | "descending" | "harmonic";

interface IntervalPlayerProps {
  rootNote?: string;
  showFretboard?: boolean;
}

// ─── Component ───

export function IntervalPlayer({
  rootNote: defaultRoot = "C4",
}: IntervalPlayerProps) {
  const [rootNoteName, setRootNoteName] = useState(
    defaultRoot.replace(/\d+$/, "")
  );
  const [octave] = useState(parseInt(defaultRoot.match(/\d+$/)?.[0] ?? "4", 10));
  const [activeInterval, setActiveInterval] = useState<number | null>(null);
  const [playMode, setPlayMode] = useState<PlayMode>("ascending");
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

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

  // ─── Play a tone with envelope ───
  const playTone = useCallback(
    (freq: number, startTime: number, duration: number, ctx: AudioContext) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      const attackTime = 0.01;
      const releaseTime = 0.05;
      const endTime = startTime + duration;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.35, startTime + attackTime);
      gain.gain.setValueAtTime(0.35, endTime - releaseTime);
      gain.gain.linearRampToValueAtTime(0, endTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(endTime + 0.01);
    },
    []
  );

  // ─── Play interval ───
  const playInterval = useCallback(
    (intervalIndex: number) => {
      const ctx = getAudioContext();
      const interval = INTERVALS[intervalIndex];

      const rootMidi = noteNameToMidi(`${rootNoteName}${octave}`);
      const rootFreq = midiToFrequency(rootMidi);
      const intervalFreq = midiToFrequency(rootMidi + interval.semitones);

      setPlayingIndex(intervalIndex);
      setActiveInterval(intervalIndex);

      const noteDuration = 0.5;
      const gap = 0.1;
      const now = ctx.currentTime;

      switch (playMode) {
        case "ascending": {
          playTone(rootFreq, now, noteDuration, ctx);
          playTone(intervalFreq, now + noteDuration + gap, noteDuration, ctx);
          // Both together
          playTone(rootFreq, now + 2 * (noteDuration + gap), noteDuration, ctx);
          playTone(intervalFreq, now + 2 * (noteDuration + gap), noteDuration, ctx);
          break;
        }
        case "descending": {
          playTone(intervalFreq, now, noteDuration, ctx);
          playTone(rootFreq, now + noteDuration + gap, noteDuration, ctx);
          // Both together
          playTone(rootFreq, now + 2 * (noteDuration + gap), noteDuration, ctx);
          playTone(intervalFreq, now + 2 * (noteDuration + gap), noteDuration, ctx);
          break;
        }
        case "harmonic": {
          playTone(rootFreq, now, noteDuration * 1.5, ctx);
          playTone(intervalFreq, now, noteDuration * 1.5, ctx);
          break;
        }
      }

      // Clear playing state after total duration
      const totalDuration =
        playMode === "harmonic"
          ? noteDuration * 1.5
          : 3 * noteDuration + 2 * gap;
      setTimeout(
        () => setPlayingIndex(null),
        totalDuration * 1000 + 100
      );
    },
    [getAudioContext, rootNoteName, octave, playMode, playTone]
  );

  const consonanceColor = (level: ConsonanceLevel) => {
    switch (level) {
      case "consonant":
        return "text-green-400";
      case "mild":
        return "text-yellow-400";
      case "dissonant":
        return "text-red-400";
    }
  };

  const consonanceLabel = (level: ConsonanceLevel) => {
    switch (level) {
      case "consonant":
        return "Consonant";
      case "mild":
        return "Mild dissonance";
      case "dissonant":
        return "Strong dissonance";
    }
  };

  const selectedInterval =
    activeInterval !== null ? INTERVALS[activeInterval] : null;

  return (
    <div className="my-6 rounded-xl border border-surface-700 bg-surface-800 p-4">
      {/* Root note selector + Play mode */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-text-muted">Root:</label>
          <select
            value={rootNoteName}
            onChange={(e) => setRootNoteName(e.target.value)}
            className="rounded-md border border-surface-600 bg-surface-700 px-2 py-1 text-xs text-text-primary"
          >
            {ROOT_NOTES.map((n) => (
              <option key={n} value={n}>
                {n}{octave}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          {(["ascending", "descending", "harmonic"] as PlayMode[]).map(
            (mode) => (
              <button
                key={mode}
                onClick={() => setPlayMode(mode)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  playMode === mode
                    ? "bg-accent-400 text-surface-900"
                    : "bg-surface-700 text-text-secondary hover:bg-surface-600"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Interval buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        {INTERVALS.map((interval, i) => (
          <button
            key={interval.abbreviation}
            onClick={() => playInterval(i)}
            className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
              playingIndex === i
                ? "border-accent-400 bg-accent-400/20 text-accent-400 ring-2 ring-accent-400/50"
                : activeInterval === i
                ? "border-accent-500/50 bg-surface-700 text-accent-400"
                : "border-surface-600 bg-surface-700 text-text-secondary hover:border-surface-500 hover:bg-surface-600"
            }`}
          >
            <div>{interval.abbreviation}</div>
            <div className="mt-0.5 text-[10px] text-text-muted">
              {interval.semitones}st
            </div>
          </button>
        ))}
      </div>

      {/* Info panel */}
      {selectedInterval && (
        <div className="rounded-lg border border-surface-700 bg-surface-900/50 p-3">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <div>
              <span className="text-text-muted">Interval: </span>
              <span className="font-medium text-text-primary">
                {selectedInterval.name}
              </span>
            </div>
            <div>
              <span className="text-text-muted">Semitones: </span>
              <span className="font-mono text-text-primary">
                {selectedInterval.semitones}
              </span>
            </div>
            <div>
              <span className="text-text-muted">Ratio: </span>
              <span className="font-mono text-accent-400">
                {selectedInterval.ratio}
              </span>
            </div>
            <div>
              <span className="text-text-muted">Character: </span>
              <span
                className={`font-medium ${consonanceColor(
                  selectedInterval.consonance
                )}`}
              >
                {consonanceLabel(selectedInterval.consonance)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
