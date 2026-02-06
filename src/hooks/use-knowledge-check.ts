"use client";

import { useCallback, useState, useMemo } from "react";
import type { KnowledgeCheckQuestion } from "@/types/index";
import { getQuestionsForLesson } from "@/lib/knowledge-check-questions";

// ─── Types ───

export type KnowledgeCheckMode = "ready" | "in-progress" | "complete";

interface KnowledgeCheckState {
  mode: KnowledgeCheckMode;
  questions: KnowledgeCheckQuestion[];
  currentIndex: number;
  score: number;
  lastAnswer: {
    correct: boolean;
    correctAnswer: string;
    explanation: string;
  } | null;
}

export interface UseKnowledgeCheckReturn extends KnowledgeCheckState {
  currentQuestion: KnowledgeCheckQuestion | null;
  total: number;
  passed: boolean;
  startCheck: () => void;
  answerQuestion: (answer: string) => void;
  reset: () => void;
}

// ─── Hook ───

export function useKnowledgeCheck(
  levelId: string,
  lessonId: string,
  lessonOrder: number
): UseKnowledgeCheckReturn {
  const [state, setState] = useState<KnowledgeCheckState>({
    mode: "ready",
    questions: [],
    currentIndex: 0,
    score: 0,
    lastAnswer: null,
  });

  const currentQuestion =
    state.mode === "in-progress" && state.currentIndex < state.questions.length
      ? state.questions[state.currentIndex]
      : null;

  const total = state.questions.length;
  const passed = state.score >= Math.ceil(total * 0.8); // 80% = 4/5

  const startCheck = useCallback(() => {
    const questions = getQuestionsForLesson(levelId, lessonId, lessonOrder);
    setState({
      mode: "in-progress",
      questions,
      currentIndex: 0,
      score: 0,
      lastAnswer: null,
    });
  }, [levelId, lessonId, lessonOrder]);

  const answerQuestion = useCallback(
    (answer: string) => {
      const question = state.questions[state.currentIndex];
      if (!question) return;

      const correct = answer === question.correctAnswer;
      const newScore = state.score + (correct ? 1 : 0);
      const newIndex = state.currentIndex + 1;
      const isComplete = newIndex >= state.questions.length;

      setState((prev) => ({
        ...prev,
        currentIndex: newIndex,
        score: newScore,
        mode: isComplete ? "complete" : "in-progress",
        lastAnswer: {
          correct,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
        },
      }));
    },
    [state.questions, state.currentIndex, state.score]
  );

  const reset = useCallback(() => {
    setState({
      mode: "ready",
      questions: [],
      currentIndex: 0,
      score: 0,
      lastAnswer: null,
    });
  }, []);

  return useMemo(
    () => ({
      ...state,
      currentQuestion,
      total,
      passed,
      startCheck,
      answerQuestion,
      reset,
    }),
    [state, currentQuestion, total, passed, startCheck, answerQuestion, reset]
  );
}
