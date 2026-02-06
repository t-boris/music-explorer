import "server-only";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Level, Lesson, Exercise, Song } from "@/types/index";

// ─── Static Level Metadata (all 13 levels) ───

const LEVELS: Level[] = [
  {
    id: "level-0",
    order: 0,
    title: "Physics of Sound",
    description:
      "Understand how sound works: frequency, pitch, amplitude, and the overtone series.",
    skillFocus: ["ear"],
  },
  {
    id: "level-1",
    order: 1,
    title: "Reading Music",
    description:
      "Staff notation, clefs, note durations, time signatures, and rhythmic reading.",
    skillFocus: ["rhythm"],
  },
  {
    id: "level-2",
    order: 2,
    title: "Intervals",
    description:
      "Identify and build intervals by ear and on the fretboard. The foundation of melody and harmony.",
    skillFocus: ["intervals", "ear"],
  },
  {
    id: "level-3",
    order: 3,
    title: "Scales & Modes",
    description:
      "Major, minor, and modal scales across the neck. Pattern-based and theory-based approaches.",
    skillFocus: ["fretboard", "technique"],
  },
  {
    id: "level-4",
    order: 4,
    title: "Chords & Voicings",
    description:
      "Triad construction, seventh chords, inversions, and practical voicings across the fretboard.",
    skillFocus: ["chords", "fretboard"],
  },
  {
    id: "level-5",
    order: 5,
    title: "Rhythm & Groove",
    description:
      "Subdivisions, syncopation, swing, and groove patterns. Building a solid internal clock.",
    skillFocus: ["rhythm", "technique"],
  },
  {
    id: "level-6",
    order: 6,
    title: "Chord Progressions",
    description:
      "Common progressions, roman numeral analysis, functional harmony, and songwriting patterns.",
    skillFocus: ["chords", "ear"],
  },
  {
    id: "level-7",
    order: 7,
    title: "Pentatonic & Blues",
    description:
      "Pentatonic scales, blues scale, bending, vibrato, and blues vocabulary.",
    skillFocus: ["technique", "fretboard"],
  },
  {
    id: "level-8",
    order: 8,
    title: "Arpeggios & Sweep Picking",
    description:
      "Arpeggio shapes, sweep picking technique, and connecting arpeggios across positions.",
    skillFocus: ["technique", "fretboard"],
  },
  {
    id: "level-9",
    order: 9,
    title: "Advanced Harmony",
    description:
      "Extended chords, altered dominants, substitutions, and jazz harmony fundamentals.",
    skillFocus: ["chords", "intervals"],
  },
  {
    id: "level-10",
    order: 10,
    title: "Improvisation",
    description:
      "Target notes, approach patterns, motivic development, and playing over changes.",
    skillFocus: ["ear", "technique"],
  },
  {
    id: "level-11",
    order: 11,
    title: "Composition & Arrangement",
    description:
      "Song form, melody writing, arranging for multiple instruments, and production basics.",
    skillFocus: ["chords", "rhythm"],
  },
  {
    id: "level-12",
    order: 12,
    title: "Mastery & Expression",
    description:
      "Tone, dynamics, phrasing, stylistic fluency, and developing your musical voice.",
    skillFocus: ["ear", "technique"],
  },
];

// ─── Content Directories ───

const CONTENT_DIR = path.join(process.cwd(), "content", "levels");
const SONGS_DIR = path.join(process.cwd(), "content", "songs");

// ─── Public API ───

/**
 * Returns all 13 levels with static metadata.
 */
export function getLevels(): Level[] {
  return LEVELS;
}

/**
 * Returns a single level by ID, or null if not found.
 */
export function getLevel(levelId: string): Level | null {
  return LEVELS.find((l) => l.id === levelId) ?? null;
}

/**
 * Reads all .mdx lesson files for a given level from the content directory.
 * Returns lessons sorted by frontmatter `order`.
 */
export function getLessons(levelId: string): Lesson[] {
  const levelDir = path.join(CONTENT_DIR, levelId);

  if (!fs.existsSync(levelDir)) {
    return [];
  }

  const files = fs
    .readdirSync(levelDir)
    .filter((f) => f.endsWith(".mdx"));

  const lessons: Lesson[] = files.map((filename) => {
    const filePath = path.join(levelDir, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);
    const slug = filename.replace(/\.mdx$/, "");
    const level = LEVELS.find((l) => l.id === levelId);

    return {
      id: slug,
      levelId: data.levelId ?? levelId,
      levelTitle: level?.title ?? "",
      order: data.order ?? 0,
      title: data.title ?? slug,
      theoryContent: "", // Not loading body for listing
      tags: data.tags ?? [],
    };
  });

  return lessons.sort((a, b) => a.order - b.order);
}

/**
 * Reads a single lesson's MDX file and returns lesson data + raw MDX content.
 * Returns null if the file does not exist.
 */
export function getLesson(
  levelId: string,
  lessonSlug: string
): { lesson: Lesson; content: string } | null {
  const filePath = path.join(CONTENT_DIR, levelId, `${lessonSlug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const level = LEVELS.find((l) => l.id === levelId);

  const lesson: Lesson = {
    id: lessonSlug,
    levelId: data.levelId ?? levelId,
    levelTitle: level?.title ?? "",
    order: data.order ?? 0,
    title: data.title ?? lessonSlug,
    theoryContent: content,
    tags: data.tags ?? [],
  };

  return { lesson, content };
}

/**
 * Reads exercises from the frontmatter of a lesson's MDX file.
 * Exercises are defined inline in the MDX frontmatter `exercises` array.
 */
export function getExercisesForLesson(
  levelId: string,
  lessonSlug: string
): Exercise[] {
  const filePath = path.join(CONTENT_DIR, levelId, `${lessonSlug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);
  const exercises: Exercise[] = (data.exercises ?? []).map(
    (ex: Record<string, unknown>, index: number) => ({
      id: (ex.id as string) ?? `ex-${index + 1}`,
      lessonId: lessonSlug,
      levelId: levelId,
      order: index + 1,
      title: (ex.title as string) ?? `Exercise ${index + 1}`,
      description: (ex.description as string) ?? "",
      type: (ex.type as Exercise["type"]) ?? "theory",
      requiresRecording: (ex.requiresRecording as boolean) ?? false,
      recordingPrompt: ex.recordingPrompt as string | undefined,
      referenceAudioUrl: ex.referenceAudioUrl as string | undefined,
    })
  );

  return exercises;
}

/**
 * Returns the list of level IDs that have content (at least one .mdx file).
 */
export function getLevelsWithContent(): Set<string> {
  const result = new Set<string>();

  if (!fs.existsSync(CONTENT_DIR)) {
    return result;
  }

  const dirs = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });
  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    const levelDir = path.join(CONTENT_DIR, dir.name);
    const hasMdx = fs
      .readdirSync(levelDir)
      .some((f) => f.endsWith(".mdx"));
    if (hasMdx) {
      result.add(dir.name);
    }
  }

  return result;
}

// ─── Song API ───

/**
 * Reads all .mdx song files from the content/songs directory.
 * Returns songs sorted by difficulty (ascending).
 */
export function getSongs(): Song[] {
  if (!fs.existsSync(SONGS_DIR)) {
    return [];
  }

  const files = fs
    .readdirSync(SONGS_DIR)
    .filter((f) => f.endsWith(".mdx"));

  const songs: Song[] = files.map((filename) => {
    const filePath = path.join(SONGS_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);
    const slug = filename.replace(/\.mdx$/, "");

    return {
      id: slug,
      title: (data.title as string) ?? slug,
      artist: (data.artist as string) ?? "",
      difficulty: (data.difficulty as number) ?? 1,
      tags: (data.tags as string[]) ?? [],
      levelIds: (data.levelIds as string[]) ?? [],
      description: (data.description as string) ?? "",
    };
  });

  return songs.sort((a, b) => a.difficulty - b.difficulty);
}

/**
 * Reads a single song's MDX file and returns song data + raw MDX content.
 * Returns null if the file does not exist.
 */
export function getSong(
  songSlug: string
): { song: Song; content: string } | null {
  const filePath = path.join(SONGS_DIR, `${songSlug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  const song: Song = {
    id: songSlug,
    title: (data.title as string) ?? songSlug,
    artist: (data.artist as string) ?? "",
    difficulty: (data.difficulty as number) ?? 1,
    tags: (data.tags as string[]) ?? [],
    levelIds: (data.levelIds as string[]) ?? [],
    description: (data.description as string) ?? "",
  };

  return { song, content };
}

/**
 * Returns all songs that have a given theory tag.
 */
export function getSongsByTag(tag: string): Song[] {
  return getSongs().filter((song) => song.tags.includes(tag));
}

/**
 * Returns all songs linked to a given level ID.
 */
export function getSongsByLevel(levelId: string): Song[] {
  return getSongs().filter((song) => song.levelIds.includes(levelId));
}

/**
 * Returns all unique tags across all songs, sorted alphabetically.
 */
export function getAllSongTags(): string[] {
  const songs = getSongs();
  const tagSet = new Set<string>();
  for (const song of songs) {
    for (const tag of song.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}
