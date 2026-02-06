"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  Trophy,
  RotateCcw,
  ArrowLeft,
  AlertCircle,
  Star,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TestQuestion, TestError } from "@/types/index";

interface TestResultsProps {
  score: number;
  totalQuestions: number;
  errors: TestError[];
  questions: TestQuestion[];
  userId?: string;
  levelId: string;
  lessonId: string;
  onTryAgain: () => void;
  onComplete: () => Promise<void>;
}

export function TestResults({
  score,
  totalQuestions,
  errors,
  questions,
  userId,
  levelId,
  lessonId,
  onTryAgain,
  onComplete,
}: TestResultsProps) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const percent = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  // Auto-save for authenticated users
  useEffect(() => {
    if (userId && !saved && !saving) {
      setSaving(true);
      onComplete()
        .then(() => setSaved(true))
        .catch(() => {})
        .finally(() => setSaving(false));
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Color based on score
  const scoreColor =
    percent >= 80
      ? "text-green-400"
      : percent >= 60
        ? "text-amber-400"
        : "text-red-400";

  const scoreBorder =
    percent >= 80
      ? "border-green-500/30"
      : percent >= 60
        ? "border-amber-500/30"
        : "border-red-500/30";

  // Category breakdown for errors
  const categoryBreakdown = errors.reduce<Record<string, number>>((acc, err) => {
    const question = questions[err.questionIndex];
    if (question) {
      const cat = question.category;
      acc[cat] = (acc[cat] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Score display */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, type: "spring" }}
        className={`rounded-xl border ${scoreBorder} bg-surface-800 p-8 text-center`}
      >
        {/* Celebration for high scores */}
        {percent >= 80 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-4 flex justify-center"
          >
            <div className="flex items-center gap-1">
              <Star className="h-6 w-6 text-yellow-400" />
              <Trophy className="h-8 w-8 text-yellow-400" />
              <Star className="h-6 w-6 text-yellow-400" />
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <p className={`font-heading text-5xl font-bold ${scoreColor}`}>
            {score}/{totalQuestions}
          </p>
          <p className={`mt-1 text-lg font-medium ${scoreColor}`}>{percent}%</p>
        </motion.div>

        <p className="mt-3 text-sm text-text-secondary">
          {percent >= 80
            ? "Excellent work! You have a strong grasp of this material."
            : percent >= 60
              ? "Good effort! Review the topics below to improve."
              : "Keep practicing! Focus on the areas highlighted below."}
        </p>

        {/* Auth status */}
        {!userId && (
          <p className="mt-3 text-xs text-text-muted">
            Sign in to save your scores and track progress.
          </p>
        )}
        {userId && saved && (
          <p className="mt-3 text-xs text-green-400">
            Score saved to your progress.
          </p>
        )}
        {userId && saving && (
          <p className="mt-3 text-xs text-text-muted">Saving...</p>
        )}
      </motion.div>

      {/* Error breakdown */}
      {errors.length > 0 && (
        <div className="rounded-xl bg-surface-800 p-6">
          <h3 className="mb-4 flex items-center gap-2 font-heading text-lg text-text-primary">
            <AlertCircle className="h-5 w-5 text-red-400" />
            Incorrect Answers
          </h3>

          <div className="space-y-3">
            {errors.map((err, idx) => {
              const question = questions[err.questionIndex];
              return (
                <div
                  key={idx}
                  className="rounded-lg bg-surface-700/50 p-3 text-sm"
                >
                  <p className="text-text-secondary">
                    {question?.question ?? `Question ${err.questionIndex + 1}`}
                  </p>
                  <div className="mt-1 flex items-center gap-4">
                    <span className="text-red-400">
                      Your answer: {err.answered}
                    </span>
                    <span className="text-green-400">
                      Correct: {err.expected}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <div className="rounded-xl bg-surface-800 p-6">
          <h3 className="mb-4 flex items-center gap-2 font-heading text-lg text-text-primary">
            <BookOpen className="h-5 w-5 text-accent-400" />
            Review These Topics
          </h3>

          <div className="space-y-2">
            {Object.entries(categoryBreakdown).map(([category, count]) => (
              <div
                key={category}
                className="flex items-center justify-between rounded-lg bg-surface-700/50 px-3 py-2 text-sm"
              >
                <span className="capitalize text-text-secondary">
                  {category}
                </span>
                <span className="text-red-400">
                  {count} error{count > 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={onTryAgain}
          className="flex-1 bg-accent-500 text-surface-900 hover:bg-accent-600"
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href={`/levels/${levelId}/lessons/${lessonId}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Lesson
          </Link>
        </Button>
      </div>
    </div>
  );
}
