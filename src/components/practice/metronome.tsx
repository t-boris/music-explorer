"use client";

import { Play, Square, Hand } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { useMetronome } from "@/hooks/use-metronome";

const TIME_SIGNATURES = [
  { label: "2/4", beats: 2 },
  { label: "3/4", beats: 3 },
  { label: "4/4", beats: 4 },
  { label: "5/4", beats: 5 },
  { label: "6/8", beats: 6 },
  { label: "7/8", beats: 7 },
] as const;

interface MetronomeProps {
  /** When provided, the metronome uses an external BPM value */
  externalBpm?: number;
  /** Called when BPM changes (for integration with tempo trainer) */
  onBpmChange?: (bpm: number) => void;
  /** Compact mode hides some controls for embedding */
  compact?: boolean;
}

export function Metronome({
  externalBpm,
  onBpmChange,
  compact = false,
}: MetronomeProps) {
  const metronome = useMetronome();

  // Sync external BPM when provided
  const bpm = externalBpm ?? metronome.bpm;
  const handleBpmChange = (newBpm: number) => {
    metronome.setBpm(newBpm);
    onBpmChange?.(newBpm);
  };

  // If external BPM changed, update internal state
  if (externalBpm !== undefined && externalBpm !== metronome.bpm) {
    metronome.setBpm(externalBpm);
  }

  return (
    <div className="rounded-xl bg-surface-800 p-6">
      {/* BPM Display with pulse animation */}
      <div className="mb-4 text-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={bpm}
            initial={{ scale: 1 }}
            animate={
              metronome.isPlaying
                ? {
                    scale: [1, 1.05, 1],
                    transition: {
                      duration: 60 / bpm,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }
                : { scale: 1 }
            }
            className="inline-block font-mono text-6xl font-bold text-text-primary"
          >
            {bpm}
          </motion.span>
        </AnimatePresence>
        <p className="mt-1 text-sm text-text-muted">BPM</p>
      </div>

      {/* BPM Slider */}
      <div className="mb-4">
        <input
          type="range"
          min={40}
          max={240}
          value={bpm}
          onChange={(e) => handleBpmChange(Number(e.target.value))}
          className="w-full accent-accent-500 h-2 rounded-full bg-surface-700 appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-400
            [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-accent-400 [&::-moz-range-thumb]:border-0"
        />
      </div>

      {/* Fine adjustment buttons */}
      <div className="mb-4 flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="xs"
          onClick={() => handleBpmChange(bpm - 10)}
          disabled={bpm <= 40}
        >
          -10
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => handleBpmChange(bpm - 5)}
          disabled={bpm <= 40}
        >
          -5
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => handleBpmChange(bpm - 1)}
          disabled={bpm <= 40}
        >
          -1
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => handleBpmChange(bpm + 1)}
          disabled={bpm >= 240}
        >
          +1
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => handleBpmChange(bpm + 5)}
          disabled={bpm >= 240}
        >
          +5
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => handleBpmChange(bpm + 10)}
          disabled={bpm >= 240}
        >
          +10
        </Button>
      </div>

      {/* Beat indicator */}
      <div className="mb-5 flex items-center justify-center gap-2">
        {Array.from({ length: metronome.beatsPerMeasure }, (_, i) => (
          <motion.div
            key={i}
            animate={
              metronome.isPlaying && metronome.currentBeat === i
                ? { scale: [1, 1.3, 1], opacity: 1 }
                : { scale: 1, opacity: 0.3 }
            }
            transition={{ duration: 0.15 }}
            className={`h-4 w-4 rounded-full ${
              i === 0 ? "bg-accent-400" : "bg-accent-600"
            }`}
          />
        ))}
      </div>

      {/* Play/Stop + Tap buttons */}
      <div className="mb-4 flex items-center justify-center gap-3">
        <Button
          size="lg"
          onClick={metronome.isPlaying ? metronome.stop : metronome.start}
          className={
            metronome.isPlaying
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-accent-500 hover:bg-accent-600 text-surface-900"
          }
        >
          {metronome.isPlaying ? (
            <>
              <Square className="h-5 w-5" />
              Stop
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              Play
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            metronome.tap();
            if (metronome.bpm !== bpm) {
              onBpmChange?.(metronome.bpm);
            }
          }}
        >
          <Hand className="h-5 w-5" />
          TAP
        </Button>
      </div>

      {/* Time signature selector */}
      {!compact && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {TIME_SIGNATURES.map((ts) => (
            <button
              key={ts.label}
              onClick={() => metronome.setBeatsPerMeasure(ts.beats)}
              className={`rounded-lg px-3 py-1.5 text-sm font-mono transition-colors ${
                metronome.beatsPerMeasure === ts.beats
                  ? "bg-accent-500 text-surface-900 font-semibold"
                  : "bg-surface-700 text-text-secondary hover:bg-surface-600"
              }`}
            >
              {ts.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
