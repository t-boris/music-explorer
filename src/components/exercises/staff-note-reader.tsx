"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { ExerciseExplanation } from "@/components/exercises/exercise-explanation";

// ─── Types ───

interface StaffNoteReaderProps {
  onComplete: () => void;
  completed: boolean;
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
}

// ─── Note Data ───

interface NotePosition {
  name: string;
  fullName: string;
  midi: number;
  /** Steps from bottom staff line (0 = line 1) */
  stepsFromBottom: number;
}

const TREBLE_NOTES: NotePosition[] = [
  { name: "C4", fullName: "Middle C", midi: 60, stepsFromBottom: -2 },
  { name: "D4", fullName: "D4", midi: 62, stepsFromBottom: -1 },
  { name: "E4", fullName: "E4", midi: 64, stepsFromBottom: 0 },
  { name: "F4", fullName: "F4", midi: 65, stepsFromBottom: 1 },
  { name: "G4", fullName: "G4", midi: 67, stepsFromBottom: 2 },
  { name: "A4", fullName: "A4", midi: 69, stepsFromBottom: 3 },
  { name: "B4", fullName: "B4", midi: 71, stepsFromBottom: 4 },
  { name: "C5", fullName: "C5", midi: 72, stepsFromBottom: 5 },
  { name: "D5", fullName: "D5", midi: 74, stepsFromBottom: 6 },
  { name: "E5", fullName: "E5", midi: 76, stepsFromBottom: 7 },
  { name: "F5", fullName: "F5", midi: 77, stepsFromBottom: 8 },
];

const REQUIRED_STREAK = 4;

// ─── SVG Layout ───

const LINE_SPACING = 14;
const HALF_SPACE = LINE_SPACING / 2;
const PAD_TOP = 32;
const PAD_BOTTOM = 28;
const PAD_LEFT = 20;
const CLEF_WIDTH = 46;
const NOTE_AREA_WIDTH = 60;
const SVG_WIDTH = PAD_LEFT + CLEF_WIDTH + NOTE_AREA_WIDTH + 20;
const SVG_HEIGHT = PAD_TOP + 4 * LINE_SPACING + PAD_BOTTOM;

// ─── Helpers ───

function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function stepsToY(steps: number): number {
  return PAD_TOP + 4 * LINE_SPACING - steps * HALF_SPACE;
}

function getLedgerLineYs(steps: number): number[] {
  const ys: number[] = [];
  if (steps <= -2) {
    for (let s = -2; s >= steps; s -= 2) ys.push(stepsToY(s));
  }
  if (steps >= 10) {
    for (let s = 10; s <= steps; s += 2) ys.push(stepsToY(s));
  }
  return ys;
}

function pickRandom<T>(arr: T[], exclude?: T): T {
  const filtered = exclude !== undefined ? arr.filter((x) => x !== exclude) : arr;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function generateChoices(correct: NotePosition): string[] {
  const letterOnly = (n: string) => n.charAt(0);
  const correctLetter = letterOnly(correct.name);

  // Pick 3 wrong note letters
  const allLetters = ["C", "D", "E", "F", "G", "A", "B"];
  const wrongLetters: string[] = [];
  while (wrongLetters.length < 3) {
    const letter = pickRandom(allLetters);
    if (letter !== correctLetter && !wrongLetters.includes(letter)) {
      wrongLetters.push(letter);
    }
  }

  const choices = [correct.name, ...wrongLetters.map((l) => {
    // Use a plausible octave for the wrong choice
    const octave = correct.name.match(/\d+/)?.[0] ?? "4";
    return `${l}${octave}`;
  })];

  // Shuffle
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices;
}

// ─── Component ───

export function StaffNoteReader({
  onComplete,
  completed,
  lessonTitle,
  levelTitle,
  levelOrder,
}: StaffNoteReaderProps) {
  const [done, setDone] = useState(completed);
  const [currentNote, setCurrentNote] = useState<NotePosition>(
    () => pickRandom(TREBLE_NOTES)
  );
  const [choices, setChoices] = useState<string[]>(
    () => generateChoices(currentNote)
  );
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{
    selected: string;
    correct: boolean;
  } | null>(null);
  const [explanation, setExplanation] = useState<{
    question: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  } | null>(null);
  const completedRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback(
    (midi: number) => {
      const ctx = getAudioContext();
      const freq = midiToFrequency(midi);
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
      gain.gain.setValueAtTime(0.3, now + 0.35);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    },
    [getAudioContext]
  );

  const nextRound = useCallback(() => {
    const next = pickRandom(TREBLE_NOTES, currentNote);
    setCurrentNote(next);
    setChoices(generateChoices(next));
    setFeedback(null);
  }, [currentNote]);

  const handleChoice = useCallback(
    (choice: string) => {
      if (feedback || done) return;

      const isCorrect = choice === currentNote.name;
      playTone(currentNote.midi);

      setFeedback({ selected: choice, correct: isCorrect });

      const positionDesc =
        currentNote.stepsFromBottom % 2 === 0
          ? `line ${Math.floor(currentNote.stepsFromBottom / 2) + 1}`
          : `space ${Math.floor(currentNote.stepsFromBottom / 2) + 1}`;

      setExplanation({
        question: `What note is on ${positionDesc} of the treble clef?`,
        studentAnswer: choice,
        correctAnswer: `${currentNote.name} — ${currentNote.stepsFromBottom < 0 ? "ledger line below" : currentNote.stepsFromBottom > 8 ? "ledger line above" : `${positionDesc}`}`,
        isCorrect,
      });

      if (isCorrect) {
        const newStreak = streak + 1;
        setStreak(newStreak);

        if (newStreak >= REQUIRED_STREAK && !completedRef.current) {
          completedRef.current = true;
          setTimeout(() => {
            setDone(true);
            onComplete();
          }, 1200);
        } else {
          setTimeout(nextRound, 1200);
        }
      } else {
        setStreak(0);
        setTimeout(nextRound, 2000);
      }
    },
    [feedback, done, currentNote, playTone, streak, onComplete, nextRound]
  );

  const noteX = PAD_LEFT + CLEF_WIDTH + NOTE_AREA_WIDTH / 2;
  const noteY = stepsToY(currentNote.stepsFromBottom);
  const ledgerYs = getLedgerLineYs(currentNote.stepsFromBottom);

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-4">
      <h3 className="mb-1 text-sm font-semibold text-text-primary">
        Read the Note
      </h3>
      <p className="mb-3 text-xs text-text-muted">
        Identify the note shown on the staff. Get {REQUIRED_STREAK} in a row to
        complete.
      </p>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-2 py-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-surface-900">
              <Check className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-green-400">
              Note reading mastered!
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Staff with note */}
            <div className="mb-4 flex justify-center">
              <svg
                width={SVG_WIDTH}
                height={SVG_HEIGHT}
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              >
                {/* Staff lines */}
                {Array.from({ length: 5 }, (_, i) => (
                  <line
                    key={`line-${i}`}
                    x1={PAD_LEFT}
                    y1={PAD_TOP + i * LINE_SPACING}
                    x2={SVG_WIDTH - 20}
                    y2={PAD_TOP + i * LINE_SPACING}
                    stroke="oklch(40% 0.02 250)"
                    strokeWidth={1}
                  />
                ))}

                {/* Treble clef */}
                <text
                  x={PAD_LEFT + 6}
                  y={PAD_TOP + 3.65 * LINE_SPACING}
                  fontSize={64}
                  fontFamily="serif"
                  fill="oklch(55% 0.02 250)"
                >
                  {"\u{1D11E}"}
                </text>

                {/* Ledger lines */}
                {ledgerYs.map((ly, i) => (
                  <line
                    key={`ledger-${i}`}
                    x1={noteX - 16}
                    y1={ly}
                    x2={noteX + 16}
                    y2={ly}
                    stroke="oklch(40% 0.02 250)"
                    strokeWidth={1}
                  />
                ))}

                {/* Notehead */}
                <motion.ellipse
                  key={currentNote.name}
                  cx={noteX}
                  cy={noteY}
                  rx={8}
                  ry={6}
                  fill={
                    feedback === null
                      ? "oklch(75% 0.15 250)"
                      : feedback.correct
                      ? "oklch(65% 0.2 150)"
                      : "oklch(60% 0.2 25)"
                  }
                  transform={`rotate(-10 ${noteX} ${noteY})`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              </svg>
            </div>

            {/* Streak indicator */}
            <div className="mb-3 flex justify-center gap-1.5">
              {Array.from({ length: REQUIRED_STREAK }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i < streak
                      ? "bg-green-400"
                      : "bg-surface-600"
                  }`}
                />
              ))}
            </div>

            {/* Choices */}
            <div className="flex justify-center gap-2">
              {choices.map((choice) => {
                const isSelected = feedback?.selected === choice;
                const isCorrectChoice = choice === currentNote.name;
                const showCorrect = feedback && isCorrectChoice;
                const showWrong = isSelected && !feedback?.correct;

                return (
                  <button
                    key={choice}
                    onClick={() => handleChoice(choice)}
                    disabled={!!feedback}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                      showCorrect
                        ? "border-green-500 bg-green-500/20 text-green-400"
                        : showWrong
                        ? "border-red-500 bg-red-500/20 text-red-400"
                        : feedback
                        ? "border-surface-700 bg-surface-700 text-text-muted"
                        : "border-surface-600 bg-surface-700 text-text-secondary hover:border-surface-500 hover:bg-surface-600"
                    }`}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>

            {/* Hear button */}
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => playTone(currentNote.midi)}
                className="rounded bg-surface-700 px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-surface-600"
              >
                Hear this note
              </button>
            </div>

            <AnimatePresence>
              {explanation && (
                <ExerciseExplanation
                  exerciseTitle="Read Note Names"
                  exerciseType="theory"
                  question={explanation.question}
                  studentAnswer={explanation.studentAnswer}
                  correctAnswer={explanation.correctAnswer}
                  isCorrect={explanation.isCorrect}
                  lessonTitle={lessonTitle}
                  levelTitle={levelTitle}
                  levelOrder={levelOrder}
                  onClose={() => setExplanation(null)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
