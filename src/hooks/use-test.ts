"use client";

import { useCallback, useState } from "react";
import type { TestQuestion, TestError } from "@/types/index";
import {
  generateIntervalQuestions,
  generateFretboardQuestions,
  generateScaleQuestions,
  generateChordQuestions,
} from "@/lib/test-questions";
import {
  saveTestAttempt,
  updateProgressFromTest,
} from "@/lib/test-service";

// ─── Types ───

export type TestMode = "loading" | "in-progress" | "complete";
export type TestType = "intervals" | "fretboard" | "scales" | "chords" | "ear-intervals";

interface TestAnswer {
  questionId: string;
  answer: string;
  correct: boolean;
}

interface UseTestState {
  mode: TestMode;
  questions: TestQuestion[];
  currentIndex: number;
  answers: TestAnswer[];
  score: number;
  errors: TestError[];
  testType: TestType | null;
}

interface UseTestReturn extends UseTestState {
  currentQuestion: TestQuestion | null;
  progress: string;
  startTest: (type: TestType, count?: number) => void;
  answerQuestion: (answer: string) => { correct: boolean; correctAnswer: string };
  completeTest: (userId?: string, levelId?: string) => Promise<void>;
  reset: () => void;
}

// ─── Hook ───

export function useTest(): UseTestReturn {
  const [state, setState] = useState<UseTestState>({
    mode: "loading",
    questions: [],
    currentIndex: 0,
    answers: [],
    score: 0,
    errors: [],
    testType: null,
  });

  const currentQuestion =
    state.mode === "in-progress" && state.currentIndex < state.questions.length
      ? state.questions[state.currentIndex]
      : null;

  const progress =
    state.questions.length > 0
      ? `${Math.min(state.currentIndex + 1, state.questions.length)} of ${state.questions.length}`
      : "0 of 0";

  const startTest = useCallback((type: TestType, count: number = 10) => {
    let questions: TestQuestion[];

    switch (type) {
      case "intervals":
      case "ear-intervals":
        questions = generateIntervalQuestions(count);
        break;
      case "fretboard":
        questions = generateFretboardQuestions(count);
        break;
      case "scales":
        questions = generateScaleQuestions(count);
        break;
      case "chords":
        questions = generateChordQuestions(count);
        break;
      default:
        questions = generateIntervalQuestions(count);
    }

    setState({
      mode: "in-progress",
      questions,
      currentIndex: 0,
      answers: [],
      score: 0,
      errors: [],
      testType: type,
    });
  }, []);

  const answerQuestion = useCallback(
    (answer: string): { correct: boolean; correctAnswer: string } => {
      const question = state.questions[state.currentIndex];
      if (!question) return { correct: false, correctAnswer: "" };

      const correct = answer === question.correctAnswer;
      const newAnswer: TestAnswer = {
        questionId: question.id,
        answer,
        correct,
      };

      const newErrors = correct
        ? state.errors
        : [
            ...state.errors,
            {
              questionIndex: state.currentIndex,
              expected: question.correctAnswer,
              answered: answer,
            },
          ];

      const newScore = state.score + (correct ? 1 : 0);
      const newIndex = state.currentIndex + 1;
      const isComplete = newIndex >= state.questions.length;

      setState((prev) => ({
        ...prev,
        currentIndex: newIndex,
        answers: [...prev.answers, newAnswer],
        score: newScore,
        errors: newErrors,
        mode: isComplete ? "complete" : "in-progress",
      }));

      return { correct, correctAnswer: question.correctAnswer };
    },
    [state.questions, state.currentIndex, state.errors, state.score]
  );

  const completeTest = useCallback(
    async (userId?: string, levelId?: string) => {
      if (!userId || !state.testType) return;

      const category =
        state.testType === "ear-intervals" ? "ear" : state.testType;

      try {
        await saveTestAttempt(userId, {
          testId: `${state.testType}-test`,
          testTitle: `${state.testType.charAt(0).toUpperCase() + state.testType.slice(1)} Test`,
          levelId: levelId ?? "",
          score: state.score,
          totalQuestions: state.questions.length,
          errors: state.errors,
        });

        await updateProgressFromTest(
          userId,
          category,
          state.score,
          state.questions.length
        );
      } catch (err) {
        console.error("Failed to save test results:", err);
      }
    },
    [state.testType, state.score, state.questions.length, state.errors]
  );

  const reset = useCallback(() => {
    setState({
      mode: "loading",
      questions: [],
      currentIndex: 0,
      answers: [],
      score: 0,
      errors: [],
      testType: null,
    });
  }, []);

  return {
    ...state,
    currentQuestion,
    progress,
    startTest,
    answerQuestion,
    completeTest,
    reset,
  };
}
