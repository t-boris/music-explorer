"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";

// ─── Types ───

interface WaveformMatcherProps {
  onComplete: () => void;
  completed: boolean;
}

// ─── Helpers ───

function randomFrequency(): number {
  return Math.round(200 + Math.random() * 600);
}

// ─── Component ───

export function WaveformMatcher({ onComplete, completed }: WaveformMatcherProps) {
  const [freq1, setFreq1] = useState(() => randomFrequency());
  const [freq2, setFreq2] = useState(() => randomFrequency());
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; freq1: number; freq2: number } | null>(null);
  const [done, setDone] = useState(completed);
  const completedRef = useRef(false);

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

  const playTone = useCallback(
    (frequency: number) => {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = frequency;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
      gain.gain.setValueAtTime(0.3, now + 0.4);
      gain.gain.linearRampToValueAtTime(0, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    },
    [getAudioContext]
  );

  const playBoth = useCallback(() => {
    playTone(freq1);
    setTimeout(() => playTone(freq2), 600);
  }, [freq1, freq2, playTone]);

  const handleAnswer = useCallback(
    (answer: "first" | "second") => {
      const higherIsFirst = freq1 > freq2;
      const correct =
        (answer === "first" && higherIsFirst) ||
        (answer === "second" && !higherIsFirst);

      setFeedback({ correct, freq1, freq2 });

      if (correct) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak >= 3 && !completedRef.current) {
          completedRef.current = true;
          setDone(true);
          onComplete();
        }
      } else {
        setStreak(0);
      }

      // Next round after brief pause
      setTimeout(() => {
        setFeedback(null);
        setFreq1(randomFrequency());
        setFreq2(randomFrequency());
      }, 1500);
    },
    [freq1, freq2, streak, onComplete]
  );

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">
          Identify Higher/Lower Pitch
        </h3>
        <span className="text-xs text-text-muted">
          Streak: {streak}/3
        </span>
      </div>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-2 py-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-surface-900">
              <Check className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-green-400">
              Exercise completed!
            </p>
          </motion.div>
        ) : (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-4 flex justify-center">
              <button
                type="button"
                onClick={playBoth}
                className="rounded-lg bg-accent-500 px-5 py-2 text-sm font-medium text-surface-900 transition-colors hover:bg-accent-400"
              >
                Play Both Tones
              </button>
            </div>

            <p className="mb-3 text-center text-xs text-text-muted">
              Which tone has a higher pitch?
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleAnswer("first")}
                disabled={feedback !== null}
                className="flex-1 rounded-lg border border-surface-600 bg-surface-700 px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Tone 1
              </button>
              <button
                type="button"
                onClick={() => handleAnswer("second")}
                disabled={feedback !== null}
                className="flex-1 rounded-lg border border-surface-600 bg-surface-700 px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Tone 2
              </button>
            </div>

            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-3 rounded-lg px-3 py-2 text-center text-xs ${
                    feedback.correct
                      ? "bg-green-500/15 text-green-400"
                      : "bg-red-500/15 text-red-400"
                  }`}
                >
                  {feedback.correct ? "Correct!" : "Not quite."}{" "}
                  Tone 1: {feedback.freq1} Hz, Tone 2: {feedback.freq2} Hz
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
