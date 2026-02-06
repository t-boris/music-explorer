"use client";

import { useCallback, useRef } from "react";

// ─── Web Audio API tone generation for ear training ───

interface UseAudioGeneratorReturn {
  playNote: (frequency: number, duration?: number) => void;
  playInterval: (rootFreq: number, intervalSemitones: number) => void;
  playChord: (frequencies: number[]) => void;
}

export function useAudioGenerator(): UseAudioGeneratorReturn {
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Create AudioContext lazily (user gesture requirement)
  const getAudioContext = useCallback((): AudioContext => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Play a sine wave at given frequency for given duration (ms)
  // Uses GainNode envelope: attack 10ms, release 50ms to avoid clicks
  const playNote = useCallback(
    (frequency: number, duration: number = 600) => {
      const ctx = getAudioContext();
      const startTime = ctx.currentTime;
      const endTime = startTime + duration / 1000;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = frequency;

      // Envelope: attack 10ms, sustain, release 50ms
      const attackTime = 0.01;
      const releaseTime = 0.05;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.4, startTime + attackTime);
      gain.gain.setValueAtTime(0.4, endTime - releaseTime);
      gain.gain.linearRampToValueAtTime(0, endTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(endTime + 0.01);
    },
    [getAudioContext]
  );

  // Play root note, pause 500ms, play interval note
  const playInterval = useCallback(
    (rootFreq: number, intervalSemitones: number) => {
      const ctx = getAudioContext();
      const intervalFreq = rootFreq * Math.pow(2, intervalSemitones / 12);
      const noteDuration = 0.6; // seconds
      const gap = 0.5; // seconds between notes

      // Play root
      const rootStart = ctx.currentTime;
      const rootEnd = rootStart + noteDuration;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.value = rootFreq;

      gain1.gain.setValueAtTime(0, rootStart);
      gain1.gain.linearRampToValueAtTime(0.4, rootStart + 0.01);
      gain1.gain.setValueAtTime(0.4, rootEnd - 0.05);
      gain1.gain.linearRampToValueAtTime(0, rootEnd);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(rootStart);
      osc1.stop(rootEnd + 0.01);

      // Play interval note after gap
      const intStart = rootEnd + gap;
      const intEnd = intStart + noteDuration;

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.value = intervalFreq;

      gain2.gain.setValueAtTime(0, intStart);
      gain2.gain.linearRampToValueAtTime(0.4, intStart + 0.01);
      gain2.gain.setValueAtTime(0.4, intEnd - 0.05);
      gain2.gain.linearRampToValueAtTime(0, intEnd);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(intStart);
      osc2.stop(intEnd + 0.01);
    },
    [getAudioContext]
  );

  // Play multiple frequencies simultaneously for chord identification
  const playChord = useCallback(
    (frequencies: number[]) => {
      const ctx = getAudioContext();
      const startTime = ctx.currentTime;
      const duration = 1.0; // seconds
      const endTime = startTime + duration;
      const volume = 0.3 / Math.max(frequencies.length, 1);

      for (const freq of frequencies) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
        gain.gain.setValueAtTime(volume, endTime - 0.05);
        gain.gain.linearRampToValueAtTime(0, endTime);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(endTime + 0.01);
      }
    },
    [getAudioContext]
  );

  return { playNote, playInterval, playChord };
}
