import type { TestQuestion } from "@/types/index";

// ─── Music Theory Data ───

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const INTERVALS: Record<number, string> = {
  0: "Unison",
  1: "Minor 2nd",
  2: "Major 2nd",
  3: "Minor 3rd",
  4: "Major 3rd",
  5: "Perfect 4th",
  6: "Tritone",
  7: "Perfect 5th",
  8: "Minor 6th",
  9: "Major 6th",
  10: "Minor 7th",
  11: "Major 7th",
  12: "Octave",
};

const GUITAR_STRINGS: { name: string; openNote: number }[] = [
  { name: "E (1st)", openNote: 4 },  // E4 → MIDI-like index
  { name: "B (2nd)", openNote: 11 },
  { name: "G (3rd)", openNote: 7 },
  { name: "D (4th)", openNote: 2 },
  { name: "A (5th)", openNote: 9 },
  { name: "E (6th)", openNote: 4 },
];

const SCALE_DEFINITIONS: Record<string, number[]> = {
  "C major": [0, 2, 4, 5, 7, 9, 11],
  "G major": [7, 9, 11, 0, 2, 4, 6],
  "D major": [2, 4, 6, 7, 9, 11, 1],
  "A minor": [9, 11, 0, 2, 4, 5, 7],
  "E minor": [4, 6, 7, 9, 11, 0, 2],
  "D minor": [2, 4, 5, 7, 9, 10, 0],
};

const CHORD_DEFINITIONS: Record<string, number[]> = {
  "C major": [0, 4, 7],
  "D minor": [2, 5, 9],
  "E minor": [4, 7, 11],
  "F major": [5, 9, 0],
  "G major": [7, 11, 2],
  "A minor": [9, 0, 4],
  "B diminished": [11, 2, 5],
  "D major": [2, 6, 9],
  "E major": [4, 8, 11],
  "A major": [9, 1, 4],
};

// ─── Helpers ───

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function pickDistractors(correct: string, pool: string[], count: number): string[] {
  const available = pool.filter((item) => item !== correct);
  return shuffle(available).slice(0, count);
}

// ─── Question Generators (pure functions) ───

export function generateIntervalQuestions(count: number): TestQuestion[] {
  const questions: TestQuestion[] = [];
  const intervalKeys = Object.keys(INTERVALS).map(Number).filter((k) => k >= 1 && k <= 12);
  const allIntervalNames = intervalKeys.map((k) => INTERVALS[k]);

  for (let i = 0; i < count; i++) {
    const rootIndex = randomInt(0, 11);
    const semitones = intervalKeys[randomInt(0, intervalKeys.length - 1)];
    const rootNote = NOTE_NAMES[rootIndex];
    const targetNote = NOTE_NAMES[(rootIndex + semitones) % 12];
    const correctAnswer = INTERVALS[semitones];

    const distractors = pickDistractors(correctAnswer, allIntervalNames, 3);
    const options = shuffle([correctAnswer, ...distractors]);

    questions.push({
      id: generateId(),
      question: `What interval is ${rootNote} to ${targetNote}?`,
      options,
      correctAnswer,
      category: "intervals",
      difficulty: semitones > 7 ? 2 : 1,
    });
  }

  return questions;
}

export function generateFretboardQuestions(count: number): TestQuestion[] {
  const questions: TestQuestion[] = [];

  for (let i = 0; i < count; i++) {
    const stringIdx = randomInt(0, GUITAR_STRINGS.length - 1);
    const fret = randomInt(0, 12);
    const guitarString = GUITAR_STRINGS[stringIdx];
    const noteIndex = (guitarString.openNote + fret) % 12;
    const correctAnswer = NOTE_NAMES[noteIndex];

    const distractors = pickDistractors(correctAnswer, NOTE_NAMES, 3);
    const options = shuffle([correctAnswer, ...distractors]);

    questions.push({
      id: generateId(),
      question: `What note is at fret ${fret} on the ${guitarString.name} string?`,
      options,
      correctAnswer,
      category: "fretboard",
      difficulty: fret > 5 ? 2 : 1,
    });
  }

  return questions;
}

export function generateScaleQuestions(count: number): TestQuestion[] {
  const questions: TestQuestion[] = [];
  const scaleNames = Object.keys(SCALE_DEFINITIONS);

  for (let i = 0; i < count; i++) {
    const scaleName = scaleNames[randomInt(0, scaleNames.length - 1)];
    const scaleNotes = SCALE_DEFINITIONS[scaleName].map((idx) => NOTE_NAMES[idx]);
    const correctAnswer = scaleNotes.join(", ");

    // Generate wrong options by altering one or two notes
    const distractors: string[] = [];
    for (let d = 0; d < 3; d++) {
      const altered = [...scaleNotes];
      const changeIdx = randomInt(0, altered.length - 1);
      const offset = randomInt(1, 2);
      const noteIdx = NOTE_NAMES.indexOf(altered[changeIdx]);
      altered[changeIdx] = NOTE_NAMES[(noteIdx + offset) % 12];
      const distractor = altered.join(", ");
      if (distractor !== correctAnswer && !distractors.includes(distractor)) {
        distractors.push(distractor);
      } else {
        // Make a different alteration
        const changeIdx2 = (changeIdx + 1) % altered.length;
        altered[changeIdx2] = NOTE_NAMES[(NOTE_NAMES.indexOf(altered[changeIdx2]) + 1) % 12];
        distractors.push(altered.join(", "));
      }
    }

    const options = shuffle([correctAnswer, ...distractors.slice(0, 3)]);

    questions.push({
      id: generateId(),
      question: `Which notes are in the ${scaleName} scale?`,
      options,
      correctAnswer,
      category: "scales",
      difficulty: scaleName.includes("minor") ? 2 : 1,
    });
  }

  return questions;
}

export function generateChordQuestions(count: number): TestQuestion[] {
  const questions: TestQuestion[] = [];
  const chordNames = Object.keys(CHORD_DEFINITIONS);

  for (let i = 0; i < count; i++) {
    const chordName = chordNames[randomInt(0, chordNames.length - 1)];
    const chordNotes = CHORD_DEFINITIONS[chordName].map((idx) => NOTE_NAMES[idx]);
    const correctAnswer = chordNotes.join(", ");

    // Generate wrong options
    const distractors: string[] = [];
    const otherChords = chordNames.filter((n) => n !== chordName);
    const picked = shuffle(otherChords).slice(0, 3);
    for (const other of picked) {
      distractors.push(
        CHORD_DEFINITIONS[other].map((idx) => NOTE_NAMES[idx]).join(", ")
      );
    }

    const options = shuffle([correctAnswer, ...distractors]);

    questions.push({
      id: generateId(),
      question: `What notes make up a ${chordName} chord?`,
      options,
      correctAnswer,
      category: "chords",
      difficulty: chordName.includes("diminished") ? 2 : 1,
    });
  }

  return questions;
}

// ─── Ear Training Helpers ───

/** Convert note name + octave to frequency (A4=440Hz) */
export function noteToFrequency(noteName: string, octave: number = 4): number {
  const noteIndex = NOTE_NAMES.indexOf(noteName);
  if (noteIndex === -1) return 440;
  const midiNote = (octave + 1) * 12 + noteIndex;
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

/** Generate a random root frequency for ear training (C3 to C5 range) */
export function randomRootFrequency(): { note: string; octave: number; frequency: number } {
  const octave = randomInt(3, 4);
  const noteIdx = randomInt(0, 11);
  const note = NOTE_NAMES[noteIdx];
  return { note, octave, frequency: noteToFrequency(note, octave) };
}

/** Get interval names for ear training options */
export function getIntervalOptions(): string[] {
  return Object.values(INTERVALS).filter((_, i) => i >= 1 && i <= 12);
}

/** Interval name to semitones */
export function intervalToSemitones(name: string): number {
  const entry = Object.entries(INTERVALS).find(([, v]) => v === name);
  return entry ? Number(entry[0]) : 0;
}

export { NOTE_NAMES, INTERVALS };
