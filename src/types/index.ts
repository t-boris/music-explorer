import type { Timestamp } from "firebase/firestore";

// ─── Content Entities (Public) ───

export interface Level {
  id: string;
  order: number;
  title: string;
  description: string;
  skillFocus: SkillType[];
}

export interface Lesson {
  id: string;
  levelId: string;
  levelTitle: string;
  order: number;
  title: string;
  theoryContent: string;
  tags: string[];
}

export interface Exercise {
  id: string;
  lessonId: string;
  levelId: string;
  order: number;
  title: string;
  description: string;
  type: "fretboard" | "rhythm" | "ear" | "theory" | "technique";
  requiresRecording: boolean;
  recordingPrompt?: string;
  referenceAudioUrl?: string;
}

export interface Test {
  id: string;
  lessonId: string;
  levelId: string;
  title: string;
  description: string;
  questionCount: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  difficulty: number;
  tags: string[];
  levelIds: string[];
  description: string;
}

// ─── Skill Reference ───

export type SkillType =
  | "rhythm"
  | "intervals"
  | "chords"
  | "fretboard"
  | "technique"
  | "ear";

export interface Skill {
  id: string;
  type: SkillType;
  name: string;
  description: string;
}

// ─── User Entities (Private) ───

export interface User {
  id: string;
  displayName: string;
  email: string;
  currentLevel: number;
  progressSummary: Record<SkillType, SkillScore>;
  streakDays: number;
  totalPracticeMinutes: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SkillScore {
  score: number;
  lastUpdated: Timestamp;
}

export interface Recording {
  id: string;
  userId: string;
  storageUrl: string;
  downloadUrl: string;
  duration: number;
  createdAt: Timestamp;
  contextType: "exercise" | "lesson" | "composition" | "free";
  contextId: string;
  contextTitle: string;
  levelId: string;
  sessionId?: string;
}

export interface TestAttempt {
  id: string;
  userId: string;
  testId: string;
  testTitle: string;
  levelId: string;
  score: number;
  totalQuestions: number;
  errors: TestError[];
  completedAt: Timestamp;
}

export interface TestError {
  questionIndex: number;
  expected: string;
  answered: string;
}

export interface PracticeSession {
  id: string;
  userId: string;
  date: string;
  durationMinutes: number;
  notes: string;
  exerciseIds: string[];
  levelId: string;
  createdAt: Timestamp;
}

export interface ProgressEntry {
  id: string;
  userId: string;
  skillType: SkillType;
  levelId: string;
  score: number;
  source: "test" | "exercise" | "manual";
  sourceId: string;
  createdAt: Timestamp;
}

export interface TempoAttempt {
  id: string;
  userId: string;
  exerciseId: string;
  exerciseTitle: string;
  startBpm: number;
  targetBpm: number;
  achievedBpm: number;
  date: string;
  createdAt: Timestamp;
}

export interface ProgressSummary {
  rhythm: SkillScore;
  intervals: SkillScore;
  chords: SkillScore;
  fretboard: SkillScore;
  technique: SkillScore;
  ear: SkillScore;
}

// ─── Dashboard ───

export interface DashboardData {
  user: User | null;
  recentSessions: PracticeSession[];
  recentRecordingsCount: number;
  recentTempoAttempts: number;
  todaySession: PracticeSession | null;
  currentStreak: number;
  totalMinutes: number;
  weeklyMinutes: number;
}
