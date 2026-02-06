import type { KnowledgeCheckQuestion } from "@/types/index";

// ─── Question Bank ───
// Pure function - no Firebase dependency (same pattern as test-questions.ts)

const questionBank: KnowledgeCheckQuestion[] = [
  // ─── Lesson 1: What is Sound? (order 1) ───
  {
    id: "l0-1-q1",
    question: "What physical property of a sound wave determines its pitch?",
    type: "multiple-choice",
    options: ["Frequency", "Amplitude", "Wavelength", "Speed"],
    correctAnswer: "Frequency",
    explanation:
      "Pitch is determined by the frequency of a sound wave — higher frequency means higher pitch.",
    lessonId: "lesson-1",
    lessonOrder: 1,
  },
  {
    id: "l0-1-q2",
    question:
      "If you double the frequency of a sound, what happens to the pitch?",
    type: "multiple-choice",
    options: [
      "It doubles",
      "It goes up by one octave",
      "It halves",
      "It stays the same",
    ],
    correctAnswer: "It goes up by one octave",
    explanation:
      "Doubling the frequency raises the pitch by exactly one octave.",
    lessonId: "lesson-1",
    lessonOrder: 1,
  },
  {
    id: "l0-1-q3",
    question: "What unit is frequency measured in?",
    type: "multiple-choice",
    options: ["Decibels", "Hertz", "Meters", "Watts"],
    correctAnswer: "Hertz",
    explanation:
      "Frequency is measured in Hertz (Hz), representing cycles per second.",
    lessonId: "lesson-1",
    lessonOrder: 1,
  },
  {
    id: "l0-1-q4",
    question:
      "True or false: A thicker guitar string vibrates faster than a thinner one.",
    type: "true-false",
    options: ["True", "False"],
    correctAnswer: "False",
    explanation:
      "Thicker strings have more mass and vibrate slower, producing lower pitches.",
    lessonId: "lesson-1",
    lessonOrder: 1,
  },
  {
    id: "l0-1-q5",
    question: "The decibel scale is:",
    type: "multiple-choice",
    options: ["Linear", "Logarithmic", "Exponential", "Constant"],
    correctAnswer: "Logarithmic",
    explanation:
      "The decibel scale is logarithmic — a 10 dB increase represents a tenfold increase in sound intensity.",
    lessonId: "lesson-1",
    lessonOrder: 1,
  },

  // ─── Lesson 2: Harmonics & Overtones (order 2) ───
  {
    id: "l0-2-q1",
    question: "The harmonic series consists of frequencies that are:",
    type: "multiple-choice",
    options: [
      "Integer multiples of the fundamental",
      "Random overtones",
      "Only odd multiples",
      "Decreasing frequencies",
    ],
    correctAnswer: "Integer multiples of the fundamental",
    explanation:
      "The harmonic series is built from integer multiples (1x, 2x, 3x, ...) of the fundamental frequency.",
    lessonId: "lesson-2",
    lessonOrder: 2,
  },
  {
    id: "l0-2-q2",
    question:
      "At which fret do you find the 2nd harmonic (one octave up)?",
    type: "multiple-choice",
    options: ["5th", "7th", "12th", "3rd"],
    correctAnswer: "12th",
    explanation:
      "The 12th fret divides the string exactly in half, producing the 2nd harmonic — one octave above the open string.",
    lessonId: "lesson-2",
    lessonOrder: 2,
  },
  {
    id: "l0-2-q3",
    question: "What determines the timbre of an instrument?",
    type: "multiple-choice",
    options: [
      "Only the fundamental frequency",
      "The relative amplitudes of harmonics",
      "The volume",
      "The duration",
    ],
    correctAnswer: "The relative amplitudes of harmonics",
    explanation:
      "Timbre is shaped by which harmonics are present and their relative strengths — this is why a guitar and a piano sound different playing the same note.",
    lessonId: "lesson-2",
    lessonOrder: 2,
  },
  {
    id: "l0-2-q4",
    question: "The frequency ratio for a perfect fifth is:",
    type: "multiple-choice",
    options: ["2:1", "3:2", "4:3", "5:4"],
    correctAnswer: "3:2",
    explanation:
      "A perfect fifth has a 3:2 frequency ratio — the 3rd harmonic divided by 2 gives a note a fifth above the fundamental.",
    lessonId: "lesson-2",
    lessonOrder: 2,
  },
  {
    id: "l0-2-q5",
    question: "What is the frequency of the 3rd harmonic of A2 (110 Hz)?",
    type: "multiple-choice",
    options: ["220 Hz", "330 Hz", "440 Hz", "550 Hz"],
    correctAnswer: "330 Hz",
    explanation:
      "The 3rd harmonic is 3 times the fundamental: 110 Hz x 3 = 330 Hz.",
    lessonId: "lesson-2",
    lessonOrder: 2,
  },

  // ─── Lesson 3: Equal Temperament & Tuning (order 3) ───
  {
    id: "l0-3-q1",
    question:
      "Equal temperament divides the octave into how many equal semitones?",
    type: "multiple-choice",
    options: ["7", "8", "10", "12"],
    correctAnswer: "12",
    explanation:
      "Equal temperament divides the octave into 12 equal semitones, each with a frequency ratio of 2^(1/12).",
    lessonId: "lesson-3",
    lessonOrder: 3,
  },
  {
    id: "l0-3-q2",
    question:
      "The formula to go up n semitones from frequency f is:",
    type: "multiple-choice",
    options: ["f + n", "f \u00d7 n", "f \u00d7 2^(n/12)", "f \u00d7 12/n"],
    correctAnswer: "f \u00d7 2^(n/12)",
    explanation:
      "Each semitone multiplies the frequency by 2^(1/12), so n semitones up is f \u00d7 2^(n/12).",
    lessonId: "lesson-3",
    lessonOrder: 3,
  },
  {
    id: "l0-3-q3",
    question: "Human pitch perception is:",
    type: "multiple-choice",
    options: ["Linear", "Logarithmic", "Exponential", "Random"],
    correctAnswer: "Logarithmic",
    explanation:
      "We perceive pitch logarithmically — equal ratios of frequency sound like equal intervals.",
    lessonId: "lesson-3",
    lessonOrder: 3,
  },
  {
    id: "l0-3-q4",
    question:
      "What is the standard tuning reference frequency for A4?",
    type: "multiple-choice",
    options: ["420 Hz", "432 Hz", "440 Hz", "450 Hz"],
    correctAnswer: "440 Hz",
    explanation:
      "The international standard tuning pitch is A4 = 440 Hz, adopted in 1955.",
    lessonId: "lesson-3",
    lessonOrder: 3,
  },
  {
    id: "l0-3-q5",
    question:
      "True or false: Moving 12 frets up on a guitar doubles the frequency.",
    type: "true-false",
    options: ["True", "False"],
    correctAnswer: "True",
    explanation:
      "Each fret raises the pitch by one semitone. 12 semitones = one octave = double the frequency.",
    lessonId: "lesson-3",
    lessonOrder: 3,
  },
];

// ─── Helpers ───

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ─── Public API ───

/**
 * Returns 5 questions scoped to the current lesson and all prior lessons
 * in the level. Weighted toward the current lesson (~3 from current, ~2 from prior).
 */
export function getQuestionsForLesson(
  _levelId: string,
  _lessonId: string,
  lessonOrder: number
): KnowledgeCheckQuestion[] {
  // Filter to questions at or before the current lesson order
  const eligible = questionBank.filter((q) => q.lessonOrder <= lessonOrder);

  // Split into current-lesson and prior-lesson pools
  const currentPool = shuffle(
    eligible.filter((q) => q.lessonOrder === lessonOrder)
  );
  const priorPool = shuffle(
    eligible.filter((q) => q.lessonOrder < lessonOrder)
  );

  const TOTAL = 5;
  const FROM_CURRENT = Math.min(3, currentPool.length);
  const FROM_PRIOR = Math.min(TOTAL - FROM_CURRENT, priorPool.length);
  const remaining = TOTAL - FROM_CURRENT - FROM_PRIOR;

  // Fill from current, then prior, then backfill from whichever pool has extras
  const selected: KnowledgeCheckQuestion[] = [
    ...currentPool.slice(0, FROM_CURRENT),
    ...priorPool.slice(0, FROM_PRIOR),
  ];

  // Backfill if either pool was short
  if (remaining > 0) {
    const backfill = [
      ...currentPool.slice(FROM_CURRENT),
      ...priorPool.slice(FROM_PRIOR),
    ];
    selected.push(...backfill.slice(0, remaining));
  }

  return shuffle(selected);
}
