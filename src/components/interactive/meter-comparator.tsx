"use client";

import { useCallback, useRef, useState } from "react";
import { Play } from "lucide-react";

// ─── Types ───

interface MeterDef {
  label: string;
  beatsPerMeasure: number;
  subdivision: string;
  groups: number[];       // How beats are grouped (e.g., [2,2,2] for 3/4, [3,3] for 6/8)
  accents: ("S" | "M" | "w")[];  // Stress pattern for each eighth note
  description: string;
  feel: string;
}

// ─── Meter definitions ───

const METERS: MeterDef[] = [
  {
    label: "3/4",
    beatsPerMeasure: 3,
    subdivision: "Each beat divides into 2 eighth notes",
    groups: [2, 2, 2],
    accents: ["S", "w", "M", "w", "M", "w"],
    description: "3 beats × 2 subdivisions = 6 eighth notes",
    feel: "THREE equal beats: 1-and 2-and 3-and",
  },
  {
    label: "6/8",
    beatsPerMeasure: 2,
    subdivision: "Each beat divides into 3 eighth notes",
    groups: [3, 3],
    accents: ["S", "w", "w", "M", "w", "w"],
    description: "2 beats × 3 subdivisions = 6 eighth notes",
    feel: "TWO swaying beats: 1-la-li 2-la-li",
  },
];

const ACCENT_STYLES: Record<"S" | "M" | "w", { bg: string; ring: string; text: string; label: string }> = {
  S: { bg: "bg-accent-500", ring: "ring-accent-400/40", text: "text-surface-900", label: "Strong" },
  M: { bg: "bg-amber-500", ring: "ring-amber-400/40", text: "text-surface-900", label: "Medium" },
  w: { bg: "bg-surface-600", ring: "ring-surface-500/30", text: "text-text-muted", label: "Weak" },
};

const COUNT_LABELS_34 = ["1", "&", "2", "&", "3", "&"];
const COUNT_LABELS_68 = ["1", "la", "li", "2", "la", "li"];

// ─── Audio ───

function playMeterPattern(ctx: AudioContext, meter: MeterDef): number {
  const now = ctx.currentTime;
  const eighthDuration = 0.2; // Fixed eighth note duration for comparison
  const totalDuration = meter.accents.length * eighthDuration;

  meter.accents.forEach((accent, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";

    const time = now + i * eighthDuration;

    if (accent === "S") {
      osc.frequency.value = 1000;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.5, time + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, time + eighthDuration * 0.9);
    } else if (accent === "M") {
      osc.frequency.value = 900;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.3, time + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, time + eighthDuration * 0.9);
    } else {
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.12, time + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, time + eighthDuration * 0.9);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + eighthDuration);
  });

  return totalDuration * 1000 + 200;
}

// ─── Component ───

export function MeterComparator() {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [highlightBeat, setHighlightBeat] = useState<{ meter: number; beat: number } | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const handlePlay = useCallback(
    (meterIndex: number) => {
      if (playingIndex !== null) return;

      const ctx = getAudioCtx();
      const meter = METERS[meterIndex];
      setPlayingIndex(meterIndex);

      const durationMs = playMeterPattern(ctx, meter);
      const eighthDuration = 200; // ms

      // Animate beat highlights
      meter.accents.forEach((_, i) => {
        setTimeout(() => {
          setHighlightBeat({ meter: meterIndex, beat: i });
        }, i * eighthDuration);
      });

      setTimeout(() => {
        setPlayingIndex(null);
        setHighlightBeat(null);
      }, durationMs);
    },
    [playingIndex, getAudioCtx]
  );

  const handlePlayBoth = useCallback(() => {
    if (playingIndex !== null) return;

    const ctx = getAudioCtx();
    setPlayingIndex(-1); // -1 = both

    // Play 3/4 first, then 6/8 after a short pause
    const meter34 = METERS[0];
    const meter68 = METERS[1];
    const eighthDuration = 200;
    const firstDuration = meter34.accents.length * eighthDuration;
    const pause = 600;

    playMeterPattern(ctx, meter34);

    // Animate first meter
    meter34.accents.forEach((_, i) => {
      setTimeout(() => {
        setHighlightBeat({ meter: 0, beat: i });
      }, i * eighthDuration);
    });

    // Play second meter after pause
    setTimeout(() => {
      playMeterPattern(ctx, meter68);
      meter68.accents.forEach((_, i) => {
        setTimeout(() => {
          setHighlightBeat({ meter: 1, beat: i });
        }, i * eighthDuration);
      });
    }, firstDuration + pause);

    const totalDuration = firstDuration + pause + meter68.accents.length * eighthDuration + 200;
    setTimeout(() => {
      setPlayingIndex(null);
      setHighlightBeat(null);
    }, totalDuration);
  }, [playingIndex, getAudioCtx]);

  return (
    <div className="my-4 rounded-xl border border-surface-700 bg-surface-800 p-4">
      <h3 className="mb-1 text-sm font-semibold text-text-primary">
        3/4 vs 6/8: Same Notes, Different Feel
      </h3>
      <p className="mb-4 text-xs text-text-muted">
        Both meters contain 6 eighth notes per measure, but they group and accent them differently.
        Listen to each pattern to hear the distinction.
      </p>

      <div className="space-y-5">
        {METERS.map((meter, meterIndex) => {
          const countLabels = meterIndex === 0 ? COUNT_LABELS_34 : COUNT_LABELS_68;
          let beatIndex = 0;

          return (
            <div key={meter.label} className="rounded-lg border border-surface-700 bg-surface-900/50 p-3">
              {/* Header */}
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <span className="font-heading text-2xl font-bold text-text-primary">
                    {meter.label}
                  </span>
                  <span className="ml-2 text-xs text-text-muted">{meter.feel}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handlePlay(meterIndex)}
                  disabled={playingIndex !== null}
                  className="flex items-center gap-1.5 rounded-lg bg-accent-500 px-3 py-1.5 text-xs font-medium text-surface-900 transition-colors hover:bg-accent-400 disabled:opacity-50"
                >
                  <Play className="h-3 w-3" />
                  {playingIndex === meterIndex || (playingIndex === -1 && highlightBeat?.meter === meterIndex)
                    ? "Playing..."
                    : "Play"}
                </button>
              </div>

              {/* Beat visualization with grouping */}
              <div className="flex items-start gap-1">
                {meter.groups.map((groupSize, groupIndex) => {
                  const groupBeats = meter.accents.slice(beatIndex, beatIndex + groupSize);
                  const groupLabels = countLabels.slice(beatIndex, beatIndex + groupSize);
                  const startBeat = beatIndex;
                  beatIndex += groupSize;

                  return (
                    <div
                      key={groupIndex}
                      className={`flex items-start gap-1 rounded-lg border border-dashed px-1.5 py-1.5 ${
                        groupIndex === 0
                          ? "border-accent-500/30"
                          : "border-amber-500/30"
                      }`}
                    >
                      {groupBeats.map((accent, i) => {
                        const globalBeat = startBeat + i;
                        const style = ACCENT_STYLES[accent];
                        const isHighlighted =
                          highlightBeat?.meter === meterIndex &&
                          highlightBeat?.beat === globalBeat;

                        return (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${
                                style.bg
                              } ${style.text} ${
                                isHighlighted ? `ring-2 ${style.ring} scale-110` : ""
                              }`}
                            >
                              {accent}
                            </div>
                            <span className="text-[10px] text-text-muted">
                              {groupLabels[i]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Description */}
              <p className="mt-2 text-xs text-text-muted">{meter.description}</p>
            </div>
          );
        })}
      </div>

      {/* Compare button */}
      <button
        type="button"
        onClick={handlePlayBoth}
        disabled={playingIndex !== null}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-surface-600 bg-surface-700 px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-600 disabled:opacity-50"
      >
        <Play className="h-3.5 w-3.5" />
        Compare: Play 3/4 then 6/8
      </button>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-text-muted">
        {(["S", "M", "w"] as const).map((accent) => (
          <div key={accent} className="flex items-center gap-1">
            <div className={`h-3 w-3 rounded-full ${ACCENT_STYLES[accent].bg}`} />
            <span>{ACCENT_STYLES[accent].label}</span>
          </div>
        ))}
        <span className="text-text-muted/60">|</span>
        <span>Dashed boxes = beat groups</span>
      </div>
    </div>
  );
}
