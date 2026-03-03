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
  interactiveComponent?:
    | "waveform-matcher"
    | "wave-labeler"
    | "harmonic-finder"
    | "overtone-calculator"
    | "octave-matcher"
    | "frequency-calculator"
    | "staff-note-reader"
    | "ledger-line-spotter"
    | "beat-counter"
    | "rhythm-pattern-matcher"
    | "measure-filler"
    | "rhythm-math"
    | "time-sig-identifier"
    | "beat-stress-mapper"
    | "strum-pattern-builder"
    | "interval-ear-trainer"
    | "interval-speller"
    | "interval-song-match"
    | "consonance-judge";
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
  title?: string;
  notes?: string;
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
  title?: string;
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

export interface ExerciseCompletion {
  id: string;
  userId: string;
  exerciseId: string;
  exerciseTitle: string;
  lessonId: string;
  levelId: string;
  exerciseType: Exercise["type"];
  completedAt: Timestamp;
}

export interface LessonProgress {
  id: string;
  lessonId: string;
  levelId: string;
  contentReadAt: Timestamp | null;
  completedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Lesson Notes ───

export interface LessonNote {
  id: string;
  lessonId: string;
  levelId: string;
  selectedText: string;
  noteText: string;
  aiExpansion: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Gamification ───

export type GamificationEventType =
  | "exercise_completed"
  | "lesson_completed"
  | "level_up"
  | "session_logged"
  | "test_completed"
  | "recording_created";

export interface GamificationEvent {
  type: GamificationEventType;
  sourceId: string;
  levelId: string;
  lessonId: string;
  occurredAt: Timestamp;
  dedupeKey: string;
  meta: Record<string, string>;
}

export interface DailyCounts {
  dayKey: string;
  exercise_completed: number;
  lesson_completed: number;
  level_up: number;
  session_logged: number;
  test_completed: number;
  recording_created: number;
}

export interface GamificationProfile {
  totalXp: number;
  rank: string;
  streakDays: number;
  lastActiveDay: string;
  dailyCounts: DailyCounts;
  totalCounts: Record<GamificationEventType, number>;
  updatedAt: Timestamp;
}

export type BadgeId =
  | "first_exercise"
  | "first_lesson"
  | "first_test"
  | "first_recording"
  | "first_session"
  | "exercises_10"
  | "exercises_50"
  | "lessons_5"
  | "lessons_10"
  | "streak_3"
  | "streak_7"
  | "streak_30"
  | "xp_500"
  | "xp_2000"
  | "level_up_first";

export interface Badge {
  id: BadgeId;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Timestamp;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
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

// ─── Community Entities ───

export interface Connection {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromDisplayName: string;
  toDisplayName: string;
  fromPhotoURL: string | null;
  toPhotoURL: string | null;
  inviteCode: string;
  createdAt: Timestamp;
}

export interface ActivityEvent {
  id: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string | null;
  type:
    | "exercise_completed"
    | "test_completed"
    | "recording_created"
    | "session_logged"
    | "lesson_completed"
    | "level_up";
  title: string;
  metadata: Record<string, string>;
  createdAt: Timestamp;
}

export interface Comment {
  id: string;
  authorId: string;
  authorDisplayName: string;
  authorPhotoURL: string | null;
  targetUserId: string;
  targetType:
    | "recording"
    | "test_attempt"
    | "exercise_completion"
    | "practice_session";
  targetId: string;
  text: string;
  createdAt: Timestamp;
}

export interface InviteLink {
  id: string;
  userId: string;
  code: string;
  active: boolean;
  createdAt: Timestamp;
}

// ─── Knowledge Check ───

export interface KnowledgeCheckQuestion {
  id: string;
  question: string;
  type: "multiple-choice" | "true-false";
  options: string[];
  correctAnswer: string;
  explanation: string;
  lessonId: string;
  lessonOrder: number;
}

// ─── Test Questions ───

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  difficulty: number;
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
