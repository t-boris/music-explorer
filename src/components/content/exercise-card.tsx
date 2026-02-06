"use client";

import { useState, type ComponentType } from "react";
import { Check, ChevronDown, ChevronUp, Loader2, Mic, Play, RotateCcw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import type { Exercise } from "@/types/index";

import { WaveformMatcher } from "@/components/exercises/waveform-matcher";
import { WaveLabeler } from "@/components/exercises/wave-labeler";
import { HarmonicFinder } from "@/components/exercises/harmonic-finder";
import { OvertoneCalculator } from "@/components/exercises/overtone-calculator";
import { OctaveMatcher } from "@/components/exercises/octave-matcher";
import { FrequencyCalculator } from "@/components/exercises/frequency-calculator";

// ─── Interactive Component Map ───

const INTERACTIVE_COMPONENTS: Record<
  string,
  ComponentType<{ onComplete: () => void; completed: boolean }>
> = {
  "waveform-matcher": WaveformMatcher,
  "wave-labeler": WaveLabeler,
  "harmonic-finder": HarmonicFinder,
  "overtone-calculator": OvertoneCalculator,
  "octave-matcher": OctaveMatcher,
  "frequency-calculator": FrequencyCalculator,
};

// ─── Type Colors ───

const TYPE_COLORS: Record<Exercise["type"], string> = {
  ear: "bg-purple-500/15 text-purple-400",
  rhythm: "bg-green-500/15 text-green-400",
  fretboard: "bg-blue-500/15 text-blue-400",
  theory: "bg-amber-500/15 text-amber-400",
  technique: "bg-rose-500/15 text-rose-400",
};

// ─── Props ───

interface ExerciseCardProps {
  exercise: Exercise;
  completed?: boolean;
  toggling?: boolean;
  onToggle?: () => void;
}

// ─── Component ───

export function ExerciseCard({ exercise, completed, toggling, onToggle }: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isInteractive = exercise.interactiveComponent && INTERACTIVE_COMPONENTS[exercise.interactiveComponent];
  const InteractiveComponent = exercise.interactiveComponent
    ? INTERACTIVE_COMPONENTS[exercise.interactiveComponent]
    : null;

  const handleInteractiveComplete = () => {
    if (onToggle && !completed) {
      onToggle();
    }
  };

  return (
    <Card
      className={`border transition-colors ${
        completed
          ? "border-green-500/30 bg-surface-800"
          : "border-surface-700 bg-surface-800"
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          {/* Checkbox for non-interactive exercises */}
          {onToggle && !isInteractive && (
            <button
              type="button"
              onClick={onToggle}
              disabled={toggling}
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                completed
                  ? "border-green-500 bg-green-500 text-surface-900"
                  : "border-surface-500 bg-surface-700 hover:border-surface-400"
              } ${toggling ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
              aria-label={completed ? "Mark exercise as incomplete" : "Mark exercise as complete"}
            >
              {toggling ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : completed ? (
                <Check className="h-3 w-3" />
              ) : null}
            </button>
          )}

          {/* Completed badge for interactive exercises */}
          {isInteractive && completed && !expanded && (
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500 text-surface-900">
              <Check className="h-3 w-3" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base text-text-primary">
                {exercise.title}
              </CardTitle>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  TYPE_COLORS[exercise.type]
                }`}
              >
                {exercise.type}
              </span>
            </div>
            <CardDescription className="mt-1 text-sm text-text-secondary">
              {exercise.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {/* Interactive exercise button and expand area */}
      {isInteractive && (
        <CardContent>
          {!expanded ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                completed
                  ? "bg-surface-700 text-text-secondary hover:bg-surface-600"
                  : "bg-accent-500 text-surface-900 hover:bg-accent-400"
              }`}
            >
              {completed ? (
                <>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Try Again
                </>
              ) : (
                <>
                  Start Exercise
                  <ChevronDown className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="mb-3 flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-text-secondary"
              >
                <ChevronUp className="h-3 w-3" />
                Collapse
              </button>
              {InteractiveComponent && (
                <InteractiveComponent
                  onComplete={handleInteractiveComplete}
                  completed={!!completed}
                />
              )}
            </div>
          )}
        </CardContent>
      )}

      {/* Recording/reference audio for non-interactive or additional info */}
      {!isInteractive && (exercise.requiresRecording || exercise.referenceAudioUrl) && (
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {exercise.requiresRecording && (
              <div className="flex items-center gap-2 rounded-lg bg-surface-700/50 px-3 py-2 text-xs text-text-muted">
                <Mic className="h-3.5 w-3.5 text-accent-400" />
                <span>
                  {exercise.recordingPrompt ?? "Recording required"}
                </span>
              </div>
            )}
            {exercise.referenceAudioUrl && (
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-surface-700/50 px-3 py-2 text-xs text-text-muted transition-colors hover:bg-surface-600"
                disabled
                title="Audio player coming in Phase 3"
              >
                <Play className="h-3.5 w-3.5 text-accent-400" />
                <span>Reference audio</span>
              </button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
