"use client";

import { useState } from "react";
import {
  ChevronUp,
  Flag,
  RotateCcw,
  Save,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metronome } from "@/components/practice/metronome";
import { useTempoTrainer } from "@/hooks/use-tempo-trainer";
import { logTempoAttempt } from "@/lib/tempo-service";

interface TempoTrainerProps {
  userId: string;
}

export function TempoTrainer({ userId }: TempoTrainerProps) {
  const trainer = useTempoTrainer();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const progressPercent =
    trainer.targetBpm > trainer.startBpm
      ? Math.min(
          100,
          ((trainer.currentBpm - trainer.startBpm) /
            (trainer.targetBpm - trainer.startBpm)) *
            100
        )
      : 0;

  const handleLogAttempt = async () => {
    setSaving(true);
    try {
      await logTempoAttempt(userId, {
        exerciseId: trainer.exerciseId,
        exerciseTitle: trainer.exerciseTitle,
        startBpm: trainer.startBpm,
        targetBpm: trainer.targetBpm,
        achievedBpm: trainer.currentBpm,
        date: new Date().toISOString().split("T")[0],
      });
      setSaved(true);
    } catch (err) {
      console.error("Failed to log tempo attempt:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSaved(false);
    trainer.reset();
  };

  // ─── Setup Mode ───
  if (trainer.mode === "setup") {
    return (
      <div className="rounded-xl bg-surface-800 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-heading text-text-primary">
          <Zap className="h-5 w-5 text-accent-400" />
          Tempo Trainer
        </h3>

        <div className="space-y-4">
          {/* Exercise title */}
          <div>
            <label className="mb-1 block text-sm text-text-secondary">
              Exercise Name
            </label>
            <input
              type="text"
              value={trainer.exerciseTitle}
              onChange={(e) => trainer.setExerciseTitle(e.target.value)}
              placeholder="e.g. Chromatic Scale"
              className="w-full rounded-lg bg-surface-700 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>

          {/* BPM inputs row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-sm text-text-secondary">
                Start BPM
              </label>
              <input
                type="number"
                min={40}
                max={240}
                value={trainer.startBpm}
                onChange={(e) =>
                  trainer.setStartBpm(
                    Math.max(40, Math.min(240, Number(e.target.value)))
                  )
                }
                className="w-full rounded-lg bg-surface-700 px-3 py-2 text-center font-mono text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">
                Target BPM
              </label>
              <input
                type="number"
                min={40}
                max={240}
                value={trainer.targetBpm}
                onChange={(e) =>
                  trainer.setTargetBpm(
                    Math.max(40, Math.min(240, Number(e.target.value)))
                  )
                }
                className="w-full rounded-lg bg-surface-700 px-3 py-2 text-center font-mono text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">
                Step
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={trainer.step}
                onChange={(e) =>
                  trainer.setStep(
                    Math.max(1, Math.min(20, Number(e.target.value)))
                  )
                }
                className="w-full rounded-lg bg-surface-700 px-3 py-2 text-center font-mono text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
          </div>

          <Button
            onClick={trainer.startTraining}
            disabled={trainer.startBpm >= trainer.targetBpm}
            className="w-full bg-accent-500 text-surface-900 hover:bg-accent-600"
          >
            <TrendingUp className="h-4 w-4" />
            Start Training
          </Button>
        </div>
      </div>
    );
  }

  // ─── Training Mode ───
  if (trainer.mode === "training") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-surface-800 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-heading text-text-primary">
              <Zap className="h-5 w-5 text-accent-400" />
              Training: {trainer.exerciseTitle}
            </h3>
            <span className="text-sm text-text-secondary">
              {trainer.currentBpm} / {trainer.targetBpm} BPM
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="h-3 w-full overflow-hidden rounded-full bg-surface-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-600 to-accent-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-text-muted">
              <span>{trainer.startBpm}</span>
              <span>{trainer.targetBpm}</span>
            </div>
          </div>

          {/* Metronome playing at current training BPM */}
          <Metronome externalBpm={trainer.currentBpm} compact />

          {/* Training controls */}
          <div className="mt-4 flex items-center gap-3">
            <Button
              onClick={trainer.advance}
              className="flex-1 bg-green-600 text-white hover:bg-green-700"
            >
              <ChevronUp className="h-5 w-5" />
              Got it! Next +{trainer.step}
            </Button>
            <Button
              variant="outline"
              onClick={trainer.markLimit}
              className="flex-1"
            >
              <Flag className="h-5 w-5" />
              That&apos;s my limit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Complete Mode ───
  return (
    <div className="rounded-xl bg-surface-800 p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-heading text-text-primary">
        <Flag className="h-5 w-5 text-accent-400" />
        Training Complete
      </h3>

      {/* Summary card */}
      <div className="mb-4 rounded-lg bg-surface-700 p-4">
        <p className="mb-1 text-sm text-text-secondary">
          {trainer.exerciseTitle}
        </p>
        <div className="flex items-baseline gap-4">
          <div>
            <span className="text-xs text-text-muted">Started</span>
            <p className="font-mono text-lg text-text-primary">
              {trainer.startBpm}
            </p>
          </div>
          <div className="text-text-muted">&rarr;</div>
          <div>
            <span className="text-xs text-text-muted">Achieved</span>
            <p className="font-mono text-2xl font-bold text-accent-400">
              {trainer.currentBpm}
            </p>
          </div>
          <div className="text-text-muted">&rarr;</div>
          <div>
            <span className="text-xs text-text-muted">Target</span>
            <p className="font-mono text-lg text-text-primary">
              {trainer.targetBpm}
            </p>
          </div>
        </div>
        {trainer.currentBpm >= trainer.targetBpm && (
          <p className="mt-2 text-sm font-medium text-green-400">
            Target reached!
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {!saved ? (
          <Button
            onClick={handleLogAttempt}
            disabled={saving}
            className="flex-1 bg-accent-500 text-surface-900 hover:bg-accent-600"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Log Attempt"}
          </Button>
        ) : (
          <p className="flex-1 text-center text-sm text-green-400">
            Attempt logged!
          </p>
        )}
        <Button variant="outline" onClick={handleReset} className="flex-1">
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
