"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, XCircle, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTest, type TestType } from "@/hooks/use-test";
import { TestResults } from "@/components/test/test-results";

interface TheoryTestProps {
  testType: TestType;
  userId?: string;
  levelId: string;
  lessonId: string;
}

export function TheoryTest({
  testType,
  userId,
  levelId,
  lessonId,
}: TheoryTestProps) {
  const test = useTest();
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    correctAnswer: string;
  } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [startTime] = useState(() => Date.now());

  // Timer
  useEffect(() => {
    if (test.mode !== "in-progress") return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [test.mode, startTime]);

  // Auto-start test
  useEffect(() => {
    if (test.mode === "loading") {
      test.startTest(testType);
    }
  }, [test, testType]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (feedback) return; // Prevent double-click during feedback
      const result = test.answerQuestion(answer);
      setFeedback(result);

      // Clear feedback after delay and show next question
      setTimeout(() => {
        setFeedback(null);
      }, 1200);
    },
    [test, feedback]
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Results screen
  if (test.mode === "complete") {
    return (
      <TestResults
        score={test.score}
        totalQuestions={test.questions.length}
        errors={test.errors}
        questions={test.questions}
        userId={userId}
        levelId={levelId}
        lessonId={lessonId}
        onTryAgain={() => {
          test.reset();
          setElapsed(0);
        }}
        onComplete={() => test.completeTest(userId, levelId)}
      />
    );
  }

  // Loading state
  if (test.mode === "loading" || !test.currentQuestion) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-text-muted">Loading questions...</div>
      </div>
    );
  }

  const progressPercent =
    (test.currentIndex / test.questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <BookOpen className="h-4 w-4" />
          <span>{test.progress}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Clock className="h-4 w-4" />
          <span>{formatTime(elapsed)}</span>
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
          key={test.currentQuestion.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl bg-surface-800 p-6"
        >
          <h3 className="mb-6 text-center font-heading text-xl text-text-primary sm:text-2xl">
            {test.currentQuestion.question}
          </h3>

          {/* Options grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {test.currentQuestion.options.map((option) => {
              const isCorrectAnswer =
                feedback && option === feedback.correctAnswer;
              const isWrongAnswer =
                feedback &&
                !feedback.correct &&
                option !== feedback.correctAnswer &&
                option ===
                  test.currentQuestion?.options.find(
                    (o) =>
                      o !== feedback.correctAnswer &&
                      test.answers[test.answers.length - 1]?.answer === o
                  );

              let optionClass =
                "rounded-lg border border-surface-600 bg-surface-700 px-4 py-3 text-left text-sm font-medium text-text-primary transition-all hover:border-accent-500 hover:bg-surface-600";

              if (feedback) {
                if (isCorrectAnswer) {
                  optionClass =
                    "rounded-lg border border-green-500 bg-green-500/20 px-4 py-3 text-left text-sm font-medium text-green-300";
                } else if (isWrongAnswer) {
                  optionClass =
                    "rounded-lg border border-red-500 bg-red-500/20 px-4 py-3 text-left text-sm font-medium text-red-300";
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
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    )}
                    {feedback && isWrongAnswer && (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Score preview */}
      <div className="text-center text-sm text-text-muted">
        Score: {test.score} / {test.currentIndex}
      </div>
    </div>
  );
}
