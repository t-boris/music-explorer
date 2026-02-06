"use client";

import { useCallback, useState } from "react";

export type TempoTrainerMode = "setup" | "training" | "complete";

interface TempoTrainerState {
  mode: TempoTrainerMode;
  exerciseId: string;
  exerciseTitle: string;
  startBpm: number;
  targetBpm: number;
  currentBpm: number;
  step: number;
  isActive: boolean;
}

interface UseTempoTrainerReturn extends TempoTrainerState {
  setExerciseId: (id: string) => void;
  setExerciseTitle: (title: string) => void;
  setStartBpm: (bpm: number) => void;
  setTargetBpm: (bpm: number) => void;
  setStep: (step: number) => void;
  startTraining: () => void;
  advance: () => void;
  markLimit: () => void;
  reset: () => void;
}

export function useTempoTrainer(): UseTempoTrainerReturn {
  const [mode, setMode] = useState<TempoTrainerMode>("setup");
  const [exerciseId, setExerciseId] = useState("general");
  const [exerciseTitle, setExerciseTitle] = useState("General Practice");
  const [startBpm, setStartBpm] = useState(60);
  const [targetBpm, setTargetBpm] = useState(120);
  const [currentBpm, setCurrentBpm] = useState(60);
  const [step, setStep] = useState(5);
  const [isActive, setIsActive] = useState(false);

  const startTraining = useCallback(() => {
    setCurrentBpm(startBpm);
    setIsActive(true);
    setMode("training");
  }, [startBpm]);

  const advance = useCallback(() => {
    setCurrentBpm((prev) => {
      const next = prev + step;
      if (next >= targetBpm) {
        // Reached the target
        setMode("complete");
        setIsActive(false);
        return targetBpm;
      }
      return next;
    });
  }, [step, targetBpm]);

  const markLimit = useCallback(() => {
    // User hit their limit at current BPM
    setMode("complete");
    setIsActive(false);
  }, []);

  const reset = useCallback(() => {
    setMode("setup");
    setCurrentBpm(startBpm);
    setIsActive(false);
  }, [startBpm]);

  return {
    mode,
    exerciseId,
    exerciseTitle,
    startBpm,
    targetBpm,
    currentBpm,
    step,
    isActive,
    setExerciseId,
    setExerciseTitle,
    setStartBpm,
    setTargetBpm,
    setStep,
    startTraining,
    advance,
    markLimit,
    reset,
  };
}
