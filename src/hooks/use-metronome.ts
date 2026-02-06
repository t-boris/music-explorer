"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Look-ahead scheduler constants ───
const SCHEDULE_AHEAD_TIME = 0.1; // seconds to schedule ahead
const LOOKAHEAD_INTERVAL = 25; // ms between scheduler calls

interface MetronomeState {
  bpm: number;
  isPlaying: boolean;
  currentBeat: number;
  beatsPerMeasure: number;
}

interface UseMetronomeReturn extends MetronomeState {
  setBpm: (bpm: number) => void;
  setBeatsPerMeasure: (n: number) => void;
  start: () => void;
  stop: () => void;
  tap: () => void;
}

export function useMetronome(): UseMetronomeReturn {
  const [bpm, setBpmState] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [beatsPerMeasure, setBeatsPerMeasureState] = useState(4);

  // Refs for the scheduler (avoid stale closures)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentBeatRef = useRef(0);
  const bpmRef = useRef(bpm);
  const beatsPerMeasureRef = useRef(beatsPerMeasure);
  const isPlayingRef = useRef(false);
  const tapTimesRef = useRef<number[]>([]);

  // Keep refs in sync with state
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    beatsPerMeasureRef.current = beatsPerMeasure;
  }, [beatsPerMeasure]);

  // ─── Create AudioContext on demand (browser policy: user gesture required) ───
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // ─── Schedule a single click at a precise time ───
  const scheduleClick = useCallback(
    (time: number, beat: number) => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Downbeat (beat 0) gets a higher pitch
      osc.frequency.value = beat === 0 ? 1000 : 800;
      osc.type = "sine";

      // Quick envelope for clean tick sound
      const attackTime = 0.001;
      const decayTime = 0.05;

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(1, time + attackTime);
      gain.gain.exponentialRampToValueAtTime(0.001, time + attackTime + decayTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + attackTime + decayTime + 0.01);
    },
    []
  );

  // ─── Advance to next note ───
  const advanceNote = useCallback(() => {
    const secondsPerBeat = 60.0 / bpmRef.current;
    nextNoteTimeRef.current += secondsPerBeat;

    currentBeatRef.current =
      (currentBeatRef.current + 1) % beatsPerMeasureRef.current;
    setCurrentBeat(currentBeatRef.current);
  }, []);

  // ─── Look-ahead scheduler ───
  const scheduler = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    while (nextNoteTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_TIME) {
      scheduleClick(nextNoteTimeRef.current, currentBeatRef.current);
      advanceNote();
    }
  }, [scheduleClick, advanceNote]);

  // ─── Start playback ───
  const start = useCallback(() => {
    if (isPlayingRef.current) return;

    const ctx = getAudioContext();
    isPlayingRef.current = true;
    setIsPlaying(true);

    currentBeatRef.current = 0;
    setCurrentBeat(0);
    nextNoteTimeRef.current = ctx.currentTime;

    intervalRef.current = setInterval(scheduler, LOOKAHEAD_INTERVAL);
  }, [getAudioContext, scheduler]);

  // ─── Stop playback ───
  const stop = useCallback(() => {
    if (!isPlayingRef.current) return;

    isPlayingRef.current = false;
    setIsPlaying(false);

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    currentBeatRef.current = 0;
    setCurrentBeat(0);
  }, []);

  // ─── Set BPM (clamped 40-240) ───
  const setBpm = useCallback((newBpm: number) => {
    const clamped = Math.max(40, Math.min(240, Math.round(newBpm)));
    setBpmState(clamped);
  }, []);

  // ─── Set beats per measure ───
  const setBeatsPerMeasure = useCallback(
    (n: number) => {
      setBeatsPerMeasureState(n);
      // Reset beat if currently beyond the new count
      if (currentBeatRef.current >= n) {
        currentBeatRef.current = 0;
        setCurrentBeat(0);
      }
    },
    []
  );

  // ─── Tap tempo (average of last 4 tap intervals) ───
  const tap = useCallback(() => {
    const now = performance.now();
    const taps = tapTimesRef.current;

    // Reset if last tap was >2 seconds ago
    if (taps.length > 0 && now - taps[taps.length - 1] > 2000) {
      tapTimesRef.current = [];
    }

    tapTimesRef.current.push(now);

    // Keep last 5 taps (4 intervals)
    if (tapTimesRef.current.length > 5) {
      tapTimesRef.current = tapTimesRef.current.slice(-5);
    }

    const currentTaps = tapTimesRef.current;
    if (currentTaps.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < currentTaps.length; i++) {
        intervals.push(currentTaps[i] - currentTaps[i - 1]);
      }
      const avgInterval =
        intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const tapBpm = Math.round(60000 / avgInterval);
      setBpm(tapBpm);
    }

    // Initialize AudioContext on tap (user gesture)
    getAudioContext();
  }, [setBpm, getAudioContext]);

  // ─── Cleanup on unmount ───
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

  return {
    bpm,
    isPlaying,
    currentBeat,
    beatsPerMeasure,
    setBpm,
    setBeatsPerMeasure,
    start,
    stop,
    tap,
  };
}
