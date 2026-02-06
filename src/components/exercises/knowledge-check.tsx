"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle,
  XCircle,
  Lightbulb,
  RotateCcw,
  Trophy,
  AlertTriangle,
} from "lucide-react";
import { useKnowledgeCheck } from "@/hooks/use-knowledge-check";

interface KnowledgeCheckProps {
  levelId: string;
  lessonId: string;
  lessonOrder: number;
}

export function KnowledgeCheck({
  levelId,
  lessonId,
  lessonOrder,
}: KnowledgeCheckProps) {
  const check = useKnowledgeCheck(levelId, lessonId, lessonOrder);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    correctAnswer: string;
    explanation: string;
  } | null>(null);

  // Auto-advance after showing feedback
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => {
      setFeedback(null);
    }, 1500);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (feedback) return; // Prevent double-click during feedback
      const question = check.currentQuestion;
      if (!question) return;

      const correct = answer === question.correctAnswer;
      setFeedback({
        correct,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      });

      check.answerQuestion(answer);
    },
    [check, feedback]
  );

  // ─── Ready state ───
  if (check.mode === "ready") {
    return (
      <div className="rounded-xl border border-surface-700 bg-surface-800 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-500/20">
            <Lightbulb className="h-5 w-5 text-accent-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-lg font-medium text-text-primary">
              Check Your Knowledge
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              5 quick questions to reinforce what you just learned. Score 4 out
              of 5 to pass.
            </p>
            <button
              onClick={check.startCheck}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-surface-900 transition-colors hover:bg-accent-600"
            >
              <Lightbulb className="h-4 w-4" />
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Complete state ───
  if (check.mode === "complete") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-surface-700 bg-surface-800 p-6"
      >
        <div className="text-center">
          {check.passed ? (
            <>
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20">
                <Trophy className="h-7 w-7 text-green-400" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-green-400">
                Great job!
              </h3>
              <p className="mt-1 text-text-secondary">
                You scored{" "}
                <span className="font-semibold text-green-400">
                  {check.score}/{check.total}
                </span>{" "}
                — you clearly understand this material.
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20">
                <AlertTriangle className="h-7 w-7 text-amber-400" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-amber-400">
                Review and try again
              </h3>
              <p className="mt-1 text-text-secondary">
                You scored{" "}
                <span className="font-semibold text-amber-400">
                  {check.score}/{check.total}
                </span>{" "}
                — re-read the lesson and give it another shot.
              </p>
              <button
                onClick={() => {
                  check.reset();
                  setFeedback(null);
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-500/50 px-4 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/10"
              >
                <RotateCcw className="h-4 w-4" />
                Try Again
              </button>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  // ─── In-progress state ───
  const progressPercent =
    check.questions.length > 0
      ? (check.currentIndex / check.questions.length) * 100
      : 0;

  // When feedback is showing, display the previous question (currentIndex has already advanced)
  const displayQuestion = feedback
    ? check.questions[check.currentIndex - 1]
    : check.currentQuestion;

  if (!displayQuestion) return null;

  return (
    <div className="space-y-4 rounded-xl border border-surface-700 bg-surface-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Lightbulb className="h-4 w-4" />
          <span>
            Question {Math.min(check.currentIndex + (feedback ? 0 : 1), check.questions.length)} of{" "}
            {check.questions.length}
          </span>
        </div>
        <div className="text-sm text-text-muted">
          Score: {check.score}/{check.currentIndex}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-700">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent-600 to-accent-400"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={displayQuestion.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        >
          <h4 className="mb-4 text-center font-heading text-lg text-text-primary">
            {displayQuestion.question}
          </h4>

          {/* Options grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {displayQuestion.options.map((option) => {
              const isCorrectAnswer =
                feedback && option === feedback.correctAnswer;
              const isWrongAnswer =
                feedback &&
                !feedback.correct &&
                option !== feedback.correctAnswer &&
                option ===
                  displayQuestion.options.find(
                    (o) => o !== feedback.correctAnswer && o === option
                  ) &&
                option !== feedback.correctAnswer;

              // Determine if this was the user's wrong pick
              const isUserWrongPick =
                feedback &&
                !feedback.correct &&
                option !== feedback.correctAnswer &&
                // The user picked this option if it's not the correct answer
                // and feedback.correct is false
                check.currentIndex > 0 &&
                option !== feedback.correctAnswer;

              let optionClass =
                "rounded-lg border border-surface-600 bg-surface-700 px-4 py-3 text-left text-sm font-medium text-text-primary transition-all hover:border-accent-500 hover:bg-surface-600";

              if (feedback) {
                if (isCorrectAnswer) {
                  optionClass =
                    "rounded-lg border border-green-500 bg-green-500/20 px-4 py-3 text-left text-sm font-medium text-green-300";
                } else if (isWrongAnswer || isUserWrongPick) {
                  optionClass =
                    "rounded-lg border border-surface-600 bg-surface-700 px-4 py-3 text-left text-sm font-medium text-text-muted opacity-60";
                } else {
                  optionClass =
                    "rounded-lg border border-surface-600 bg-surface-700 px-4 py-3 text-left text-sm font-medium text-text-muted opacity-60";
                }
              }

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={!!feedback}
                  className={optionClass}
                >
                  <div className="flex items-center gap-2">
                    {feedback && isCorrectAnswer && (
                      <CheckCircle className="h-4 w-4 shrink-0 text-green-400" />
                    )}
                    {feedback && !isCorrectAnswer && option === feedback.correctAnswer && (
                      <XCircle className="h-4 w-4 shrink-0 text-red-400" />
                    )}
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 rounded-lg p-3 text-sm ${
                feedback.correct
                  ? "bg-green-500/10 text-green-300"
                  : "bg-red-500/10 text-red-300"
              }`}
            >
              <div className="flex items-start gap-2">
                {feedback.correct ? (
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <span>{feedback.explanation}</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
