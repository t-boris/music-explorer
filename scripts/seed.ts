/**
 * Firestore Seed Script
 *
 * Seeds foundational data: skills, levels (0-12), and sample
 * lessons/exercises for level 0. Uses fixed document IDs for
 * idempotency — re-running updates rather than duplicates.
 *
 * Usage: npx tsx scripts/seed.ts
 *
 * Requires either:
 *   - FIREBASE_SERVICE_ACCOUNT_KEY env var pointing to a service account key JSON file
 *   - FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY env vars
 */

import { getApps, initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local from project root
dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });

// ─── Firebase Admin Init ───

function initFirebase() {
  if (getApps().length > 0) {
    return getFirestore(getApps()[0]);
  }

  // Option 1: Service account key file via FIREBASE_SERVICE_ACCOUNT_KEY
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const serviceAccount = require(path.resolve(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    )) as ServiceAccount;
    const app = initializeApp({ credential: cert(serviceAccount) });
    return getFirestore(app);
  }

  // Option 2: Env vars from .env.local
  const projectId = process.env.FIREBASE_PROJECT_ID || "";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || "";
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.error(
      "Error: Firebase credentials not found.\n" +
        "Set FIREBASE_SERVICE_ACCOUNT_KEY to a service account key JSON file path,\n" +
        "or set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local"
    );
    process.exit(1);
  }

  const app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
  return getFirestore(app);
}

const db = initFirebase();

// ─── Seed Data ───

interface SkillSeed {
  id: string;
  type: string;
  name: string;
  description: string;
}

const skills: SkillSeed[] = [
  {
    id: "rhythm",
    type: "rhythm",
    name: "Rhythm",
    description: "Time, tempo, note duration, rhythmic patterns",
  },
  {
    id: "intervals",
    type: "intervals",
    name: "Intervals",
    description: "Distance between notes, recognition, construction",
  },
  {
    id: "chords",
    type: "chords",
    name: "Chords",
    description: "Chord types, construction, voicings, progressions",
  },
  {
    id: "fretboard",
    type: "fretboard",
    name: "Fretboard",
    description: "Note locations, patterns, navigation",
  },
  {
    id: "technique",
    type: "technique",
    name: "Technique",
    description: "Picking, fretting, coordination, articulation",
  },
  {
    id: "ear",
    type: "ear",
    name: "Ear Training",
    description: "Pitch recognition, interval identification, chord quality",
  },
];

interface LevelSeed {
  id: string;
  order: number;
  title: string;
  description: string;
  skillFocus: string[];
}

const levels: LevelSeed[] = [
  {
    id: "level0",
    order: 0,
    title: "Physics of Sound",
    description:
      "Frequency, wavelength, amplitude, harmonics, and how we perceive pitch. The scientific foundation for everything that follows.",
    skillFocus: ["intervals", "ear"],
  },
  {
    id: "level1",
    order: 1,
    title: "Notation System",
    description:
      "Staff, clefs, note values, rests, time signatures, and basic rhythmic literacy. Reading and writing the language of music.",
    skillFocus: ["rhythm"],
  },
  {
    id: "level2",
    order: 2,
    title: "Intervals",
    description:
      "Semitones, whole tones, interval quality and number. Consonance, dissonance, and frequency ratios that give intervals their character.",
    skillFocus: ["intervals", "ear", "fretboard"],
  },
  {
    id: "level3",
    order: 3,
    title: "Scales",
    description:
      "Chromatic scale, major scale construction, natural/harmonic/melodic minor scales. Key signatures and the circle of fifths.",
    skillFocus: ["fretboard", "technique", "intervals"],
  },
  {
    id: "level4",
    order: 4,
    title: "Chords",
    description:
      "Triads (major, minor, diminished, augmented), seventh chords, inversions, and chord voicings on guitar.",
    skillFocus: ["chords", "fretboard", "technique"],
  },
  {
    id: "level5",
    order: 5,
    title: "Functional Harmony",
    description:
      "Tonic, subdominant, dominant functions. Cadences, chord progressions, the Nashville number system, and harmonic analysis.",
    skillFocus: ["chords", "ear", "intervals"],
  },
  {
    id: "level6",
    order: 6,
    title: "Modes",
    description:
      "Church modes (Ionian through Locrian), modal interchange, characteristic tones, and modal chord progressions.",
    skillFocus: ["fretboard", "intervals", "ear"],
  },
  {
    id: "level7",
    order: 7,
    title: "Advanced Rhythm",
    description:
      "Syncopation, polyrhythm, odd time signatures, tuplets, and rhythmic displacement.",
    skillFocus: ["rhythm", "technique"],
  },
  {
    id: "level8",
    order: 8,
    title: "Advanced Harmony",
    description:
      "Extended chords (9ths, 11ths, 13ths), altered chords, secondary dominants, tritone substitutions.",
    skillFocus: ["chords", "ear", "fretboard"],
  },
  {
    id: "level9",
    order: 9,
    title: "Counterpoint",
    description:
      "Species counterpoint, voice leading, independent melodic lines, and their harmonic implications.",
    skillFocus: ["intervals", "technique"],
  },
  {
    id: "level10",
    order: 10,
    title: "Musical Form",
    description:
      "Binary, ternary, rondo, sonata forms. Song structure, arrangement, and large-scale musical organization.",
    skillFocus: ["rhythm", "chords"],
  },
  {
    id: "level11",
    order: 11,
    title: "Composition",
    description:
      "Melody writing, harmonic rhythm, motif development, arranging for guitar, and creating original pieces.",
    skillFocus: ["chords", "intervals", "technique", "ear"],
  },
  {
    id: "level12",
    order: 12,
    title: "Math & Music",
    description:
      "Fourier analysis, tuning systems (equal temperament vs just intonation), set theory, and mathematical structures in music.",
    skillFocus: ["intervals", "ear"],
  },
];

interface LessonSeed {
  id: string;
  levelId: string;
  levelTitle: string;
  order: number;
  title: string;
  theoryContent: string;
  tags: string[];
}

const level0Lessons: LessonSeed[] = [
  {
    id: "lesson-0-1",
    levelId: "level0",
    levelTitle: "Physics of Sound",
    order: 1,
    title: "What is Sound?",
    theoryContent:
      "Sound is a mechanical wave — a vibration that travels through a medium (air, water, solid). " +
      "When a guitar string vibrates, it pushes air molecules back and forth, creating areas of compression " +
      "and rarefaction. These pressure waves reach your ear and are interpreted as sound.\n\n" +
      "Three key properties define any sound wave:\n" +
      "- **Frequency** — how many cycles per second (measured in Hz). Higher frequency = higher pitch.\n" +
      "- **Wavelength** — the physical distance of one complete cycle. Inversely proportional to frequency.\n" +
      "- **Amplitude** — the intensity of the pressure variation. Greater amplitude = louder sound.",
    tags: ["physics", "frequency", "wavelength", "amplitude"],
  },
  {
    id: "lesson-0-2",
    levelId: "level0",
    levelTitle: "Physics of Sound",
    order: 2,
    title: "Harmonics & Overtones",
    theoryContent:
      "A vibrating guitar string doesn't just vibrate at one frequency. It vibrates simultaneously at " +
      "its fundamental frequency and at integer multiples: 2x (octave), 3x (octave + fifth), 4x (two octaves), etc.\n\n" +
      "This series of frequencies is called the **harmonic series**. The relative strength of each harmonic " +
      "determines the **timbre** (tone color) of an instrument. This is why a guitar playing A440 sounds " +
      "different from a piano playing A440 — same fundamental, different harmonic content.\n\n" +
      "Natural harmonics on guitar (touching the string lightly at nodes) isolate specific harmonics from the series.",
    tags: ["physics", "harmonics", "overtones", "timbre"],
  },
  {
    id: "lesson-0-3",
    levelId: "level0",
    levelTitle: "Physics of Sound",
    order: 3,
    title: "How We Hear Pitch",
    theoryContent:
      "Human pitch perception is **logarithmic**, not linear. Doubling a frequency sounds like the same " +
      "interval regardless of starting pitch — this interval is called an **octave**.\n\n" +
      "A4 = 440 Hz, A5 = 880 Hz, A3 = 220 Hz. Each octave is a 2:1 ratio.\n\n" +
      "This logarithmic perception is why the frets on a guitar get closer together as you move up the neck — " +
      "equal frequency ratios require exponentially smaller physical distances.\n\n" +
      "**Octave equivalence**: Notes an octave apart are perceived as the 'same note' in a different register. " +
      "This is the foundation of the 12-note chromatic system.",
    tags: ["physics", "perception", "logarithmic", "octave"],
  },
];

interface ExerciseSeed {
  id: string;
  lessonId: string;
  levelId: string;
  order: number;
  title: string;
  description: string;
  type: "fretboard" | "rhythm" | "ear" | "theory" | "technique";
}

const level0Exercises: ExerciseSeed[] = [
  // Exercises for Lesson 1: What is Sound?
  {
    id: "exercise-0-1-1",
    lessonId: "lesson-0-1",
    levelId: "level0",
    order: 1,
    title: "Identify Higher/Lower Pitch",
    description:
      "Listen to two tones and identify which has the higher frequency. " +
      "Focus on developing your baseline sense of relative pitch.",
    type: "ear",
  },
  {
    id: "exercise-0-1-2",
    lessonId: "lesson-0-1",
    levelId: "level0",
    order: 2,
    title: "Frequency and String Length",
    description:
      "Play open strings and fretted notes. Observe how shorter vibrating length " +
      "(higher fret) produces higher frequency. Map the physical to the audible.",
    type: "fretboard",
  },
  // Exercises for Lesson 2: Harmonics & Overtones
  {
    id: "exercise-0-2-1",
    lessonId: "lesson-0-2",
    levelId: "level0",
    order: 1,
    title: "Natural Harmonics on Guitar",
    description:
      "Touch the string lightly at the 12th, 7th, and 5th frets to produce natural harmonics. " +
      "Identify which harmonic number each position corresponds to.",
    type: "technique",
  },
  {
    id: "exercise-0-2-2",
    lessonId: "lesson-0-2",
    levelId: "level0",
    order: 2,
    title: "Match the Octave",
    description:
      "Play a note, then find the same note one octave higher on a different string. " +
      "Train your ear to recognize the 2:1 frequency relationship.",
    type: "ear",
  },
  // Exercises for Lesson 3: How We Hear Pitch
  {
    id: "exercise-0-3-1",
    lessonId: "lesson-0-3",
    levelId: "level0",
    order: 1,
    title: "Clap the Rhythm",
    description:
      "Clap along to a steady pulse. Start at 60 BPM and increase to 120 BPM. " +
      "Focus on maintaining even spacing between claps — this is your first timing exercise.",
    type: "rhythm",
  },
  {
    id: "exercise-0-3-2",
    lessonId: "lesson-0-3",
    levelId: "level0",
    order: 2,
    title: "Octave Recognition",
    description:
      "Listen to pairs of notes. Identify whether they are the same pitch, an octave apart, " +
      "or a different interval. Build your sense of octave equivalence.",
    type: "ear",
  },
];

// ─── Seed Functions ───

async function seedSkills() {
  const batch = db.batch();
  for (const skill of skills) {
    const ref = db.collection("skills").doc(skill.id);
    batch.set(ref, {
      type: skill.type,
      name: skill.name,
      description: skill.description,
    });
  }
  await batch.commit();
  console.log(`  Seeded ${skills.length} skills`);
}

async function seedLevels() {
  const batch = db.batch();
  for (const level of levels) {
    const ref = db.collection("levels").doc(level.id);
    batch.set(ref, {
      order: level.order,
      title: level.title,
      description: level.description,
      skillFocus: level.skillFocus,
    });
  }
  await batch.commit();
  console.log(`  Seeded ${levels.length} levels`);
}

async function seedLessons() {
  const batch = db.batch();
  for (const lesson of level0Lessons) {
    const ref = db
      .collection("levels")
      .doc(lesson.levelId)
      .collection("lessons")
      .doc(lesson.id);
    batch.set(ref, {
      order: lesson.order,
      title: lesson.title,
      theoryContent: lesson.theoryContent,
      tags: lesson.tags,
      levelId: lesson.levelId,
      levelTitle: lesson.levelTitle,
    });
  }
  await batch.commit();
  console.log(`  Seeded ${level0Lessons.length} lessons (level 0)`);
}

async function seedExercises() {
  const batch = db.batch();
  for (const exercise of level0Exercises) {
    const ref = db
      .collection("levels")
      .doc(exercise.levelId)
      .collection("lessons")
      .doc(exercise.lessonId)
      .collection("exercises")
      .doc(exercise.id);
    batch.set(ref, {
      order: exercise.order,
      title: exercise.title,
      description: exercise.description,
      type: exercise.type,
      lessonId: exercise.lessonId,
      levelId: exercise.levelId,
    });
  }
  await batch.commit();
  console.log(`  Seeded ${level0Exercises.length} exercises (level 0)`);
}

// ─── Main ───

async function main() {
  console.log("Seeding Firestore...\n");

  try {
    console.log("1/4 Skills:");
    await seedSkills();

    console.log("2/4 Levels:");
    await seedLevels();

    console.log("3/4 Lessons (Level 0):");
    await seedLessons();

    console.log("4/4 Exercises (Level 0):");
    await seedExercises();

    console.log("\nSeed complete!");
    console.log("  Skills: 6 docs");
    console.log("  Levels: 13 docs (0-12)");
    console.log("  Lessons: 3 docs (level 0)");
    console.log("  Exercises: 6 docs (level 0)");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

main();
