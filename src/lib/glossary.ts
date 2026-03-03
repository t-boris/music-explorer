import "server-only";

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  lessonId: string;
  levelId: string;
  lessonTitle: string;
  levelTitle: string;
  relatedTerms: string[];
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  // ─── Level 0 / Lesson 1: What is Sound? ───
  {
    id: "frequency",
    term: "Frequency",
    definition:
      "The number of complete wave cycles per second, measured in Hertz (Hz). Higher frequency means higher pitch.",
    lessonId: "lesson-1",
    levelId: "level-0",
    lessonTitle: "What is Sound?",
    levelTitle: "Physics of Sound",
    relatedTerms: ["amplitude", "wavelength", "fundamental-frequency"],
  },
  {
    id: "amplitude",
    term: "Amplitude",
    definition:
      "The height of a sound wave, which determines loudness. Greater amplitude means a louder sound.",
    lessonId: "lesson-1",
    levelId: "level-0",
    lessonTitle: "What is Sound?",
    levelTitle: "Physics of Sound",
    relatedTerms: ["frequency", "wavelength"],
  },
  {
    id: "wavelength",
    term: "Wavelength",
    definition:
      "The physical distance between two identical points on consecutive wave cycles. Inversely related to frequency.",
    lessonId: "lesson-1",
    levelId: "level-0",
    lessonTitle: "What is Sound?",
    levelTitle: "Physics of Sound",
    relatedTerms: ["frequency", "amplitude"],
  },
  {
    id: "standing-wave",
    term: "Standing Wave",
    definition:
      "A wave pattern formed when a vibrating string reflects off its fixed endpoints. The string vibrates with stationary nodes and oscillating antinodes.",
    lessonId: "lesson-1",
    levelId: "level-0",
    lessonTitle: "What is Sound?",
    levelTitle: "Physics of Sound",
    relatedTerms: ["fundamental-frequency", "node-points", "overtones"],
  },
  {
    id: "fundamental-frequency",
    term: "Fundamental Frequency",
    definition:
      "The lowest frequency a vibrating string can produce — the simplest standing wave pattern with nodes only at the two endpoints. It defines the perceived pitch of the note.",
    lessonId: "lesson-1",
    levelId: "level-0",
    lessonTitle: "What is Sound?",
    levelTitle: "Physics of Sound",
    relatedTerms: ["standing-wave", "overtones", "harmonic-series"],
  },

  // ─── Level 0 / Lesson 2: Overtones & Timbre ───
  {
    id: "overtones",
    term: "Overtones",
    definition:
      "Higher frequencies produced simultaneously with the fundamental when a string vibrates. Also called harmonics, they are integer multiples of the fundamental frequency.",
    lessonId: "lesson-2",
    levelId: "level-0",
    lessonTitle: "Overtones & Timbre",
    levelTitle: "Physics of Sound",
    relatedTerms: ["harmonic-series", "fundamental-frequency", "timbre"],
  },
  {
    id: "harmonic-series",
    term: "Harmonic Series",
    definition:
      "The complete set of frequencies produced by a vibrating string: the fundamental plus all its integer multiples (2x, 3x, 4x, etc.).",
    lessonId: "lesson-2",
    levelId: "level-0",
    lessonTitle: "Overtones & Timbre",
    levelTitle: "Physics of Sound",
    relatedTerms: ["overtones", "fundamental-frequency", "consonant"],
  },
  {
    id: "timbre",
    term: "Timbre",
    definition:
      "The unique \"color\" or \"texture\" of a sound (pronounced \"TAM-ber\"). Determined by the relative strengths of overtones — it's why a guitar and piano sound different playing the same note.",
    lessonId: "lesson-2",
    levelId: "level-0",
    lessonTitle: "Overtones & Timbre",
    levelTitle: "Physics of Sound",
    relatedTerms: ["overtones", "harmonic-series"],
  },
  {
    id: "node-points",
    term: "Node Points",
    definition:
      "Positions on a vibrating string where a harmonic's standing wave has zero displacement. Lightly touching a string at a node isolates that harmonic.",
    lessonId: "lesson-2",
    levelId: "level-0",
    lessonTitle: "Overtones & Timbre",
    levelTitle: "Physics of Sound",
    relatedTerms: ["standing-wave", "overtones"],
  },
  {
    id: "consonant",
    term: "Consonant",
    definition:
      "Describes intervals or chords that sound harmonically stable and pleasing. The simpler the frequency ratio between two notes, the more consonant the sound.",
    lessonId: "lesson-2",
    levelId: "level-0",
    lessonTitle: "Overtones & Timbre",
    levelTitle: "Physics of Sound",
    relatedTerms: ["harmonic-series", "overtones"],
  },

  // ─── Level 0 / Lesson 3: Pitch & the Musical Scale ───
  {
    id: "logarithmic",
    term: "Logarithmic",
    definition:
      "A scale where equal ratios (not equal differences) correspond to equal perceptual steps. Human hearing is logarithmic: 100→200 Hz sounds like the same jump as 1000→2000 Hz.",
    lessonId: "lesson-3",
    levelId: "level-0",
    lessonTitle: "Pitch & the Musical Scale",
    levelTitle: "Physics of Sound",
    relatedTerms: ["octave", "semitone"],
  },
  {
    id: "octave",
    term: "Octave",
    definition:
      "The interval produced by doubling a frequency. Notes an octave apart sound like the \"same\" note at a different height and share the same letter name.",
    lessonId: "lesson-3",
    levelId: "level-0",
    lessonTitle: "Pitch & the Musical Scale",
    levelTitle: "Physics of Sound",
    relatedTerms: ["logarithmic", "semitone", "equal-temperament"],
  },
  {
    id: "semitone",
    term: "Semitone",
    definition:
      "The smallest interval in Western music — one twelfth of an octave. On a guitar, moving one fret equals one semitone. The frequency ratio is the twelfth root of 2 (≈ 1.0595).",
    lessonId: "lesson-3",
    levelId: "level-0",
    lessonTitle: "Pitch & the Musical Scale",
    levelTitle: "Physics of Sound",
    relatedTerms: ["octave", "equal-temperament"],
  },
  {
    id: "equal-temperament",
    term: "Equal Temperament",
    definition:
      "A tuning system (12-TET) that divides each octave into 12 equal semitones. Every semitone has the same frequency ratio, enabling free modulation between keys.",
    lessonId: "lesson-3",
    levelId: "level-0",
    lessonTitle: "Pitch & the Musical Scale",
    levelTitle: "Physics of Sound",
    relatedTerms: ["semitone", "octave"],
  },
  {
    id: "audible-range",
    term: "Audible Range",
    definition:
      "The range of frequencies the human ear can detect — roughly 20 Hz to 20,000 Hz (20 kHz). The upper limit decreases with age. Musical instruments occupy a subset of this range.",
    lessonId: "lesson-3",
    levelId: "level-0",
    lessonTitle: "Pitch & the Musical Scale",
    levelTitle: "Physics of Sound",
    relatedTerms: ["frequency", "octave"],
  },
];

export function getGlossaryTerms(): GlossaryTerm[] {
  return [...GLOSSARY_TERMS].sort((a, b) => a.term.localeCompare(b.term));
}

export function getGlossaryTerm(id: string): GlossaryTerm | null {
  return GLOSSARY_TERMS.find((t) => t.id === id) ?? null;
}
