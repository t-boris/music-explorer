"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle,
  XCircle,
  Volume2,
  RotateCcw,
  Clock,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTest } from "@/hooks/use-test";
import { useAudioGenerator } from "@/hooks/use-audio-generator";
import { randomRootFrequency, intervalToSemitones } from "@/lib/test-questions";
import { TestResults } from "@/components/test/test-results";

interface EarTrainingProps {
  userId?: string;
  levelId: string;
  lessonId: string;
}

export function EarTraining({ userId, levelId, lessonId }: EarTrainingProps) {
  const test = useTest();
  const audio = useAudioGenerator();
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    correctAnswer: string;
  } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [isPlaying, setIsPlaying] = useState(false);
  const currentRootRef = useRef<{ frequency: number; semitones: number } | null>(null);

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
      test.startTest("ear-intervals");
    }
  }, [test]);

  // Play the current interval when a new question appears
  const playCurrentInterval = useCallback(() => {
    if (!test.currentQuestion) return;

    const root = randomRootFrequency();
    const semitones = intervalToSemitones(test.currentQuestion.correctAnswer);
    currentRootRef.current = { frequency: root.frequency, semitones };

    setIsPlaying(true);
    audio.playInterval(root.frequency, semitones);

    // Animation duration (roughly: 600ms note + 500ms gap + 600ms note)
    setTimeout(() => setIsPlaying(false), 1700);
  }, [test.currentQuestion, audio]);

  // Auto-play when question changes
  useEffect(() => {
    if (test.mode === "in-progress" && test.currentQuestion && !feedback) {
      // Small delay so the UI renders first
      const timer = setTimeout(playCurrentInterval, 300);
      return () => clearTimeout(timer);
    }
  }, [test.currentIndex, test.mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReplay = useCallback(() => {
    if (currentRootRef.current) {
      setIsPlaying(true);
      audio.playInterval(
        currentRootRef.current.frequency,
        currentRootRef.current.semitones
      );
      setTimeout(() => setIsPlaying(false), 1700);
    }
  }, [audio]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (feedback) return;
      const result = test.answerQuestion(answer);
      setFeedback(result);

      setTimeout(() => {
        setFeedback(null);
        currentRootRef.current = null;
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
        <div className="text-text-muted">Loading ear training...</div>
      </div>
    );
  }

  const progressPercent = (test.currentIndex / test.questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Headphones className="h-4 w-4" />
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

      {/* Audio playback area */}
      <div className="rounded-xl bg-surface-800 p-6">
        <h3 className="mb-4 text-center font-heading text-lg text-text-primary">
          What interval do you hear?
        </h3>

        {/* Speaker icon and play controls */}
        <div className="mb-6 flex flex-col items-center gap-4">
          <motion.div
            animate={isPlaying ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.6, repeat: isPlaying ? Infinity : 0 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-700"
          >
            <Volume2
              className={`h-10 w-10 transition-colors ${
                isPlaying ? "text-accent-400" : "text-text-muted"
              }`}
            />
          </motion.div>

          <div className="flex gap-3">
            <Button
              onClick={playCurrentInterval}
              disabled={isPlaying}
              className="bg-accent-500 text-surface-900 hover:bg-accent-600"
            >
              <Volume2 className="h-4 w-4" />
              Play
            </Button>
            <Button
              variant="outline"
              onClick={handleReplay}
              disabled={isPlaying || !currentRootRef.current}
            >
              <RotateCcw className="h-4 w-4" />
              Replay
            </Button>
          </div>
        </div>

        {/* Answer options */}
        <AnimatePresence mode="wait">
          <motion.div
            key={test.currentQuestion.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3"
          >
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
                "rounded-lg border border-surface-600 bg-surface-700 px-3 py-3 text-center text-sm font-medium text-text-primary transition-all hover:border-accent-500 hover:bg-surface-600";

              if (feedback) {
                if (isCorrectAnswer) {
                  optionClass =
                    "rounded-lg border border-green-500 bg-green-500/20 px-3 py-3 text-center text-sm font-medium text-green-300";
                } else if (isWrongAnswer) {
                  optionClass =
                    "rounded-lg border border-red-500 bg-red-500/20 px-3 py-3 text-center text-sm font-medium text-red-300";
                } else {
                  optionClass =
                    "rounded-lg border border-surface-600 bg-surface-700 px-3 py-3 text-center text-sm font-medium text-text-muted opacity-60";
                }
              }

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={!!feedback}
                  className={optionClass}
                >
                  <div className="flex items-center justify-center gap-1">
                    {feedback && isCorrectAnswer && (
                      <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                    )}
                    {feedback && isWrongAnswer && (
                      <XCircle className="h-3.5 w-3.5 text-red-400" />
                    )}
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Score preview */}
      <div className="text-center text-sm text-text-muted">
        Score: {test.score} / {test.currentIndex}
      </div>
    </div>
  );
}
