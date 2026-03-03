import type {
  GamificationEventType,
  BadgeId,
  DailyCounts,
} from "@/types/index";

// ─── XP Rewards per Event Type ───

export const XP_TABLE: Record<GamificationEventType, number> = {
  exercise_completed: 10,
  lesson_completed: 30,
  test_completed: 25,
  session_logged: 20,
  recording_created: 15,
  level_up: 50,
};

// ─── Anti-Grind Daily Caps ───

export const DAILY_CAPS: Record<GamificationEventType, number> = {
  exercise_completed: 20,
  lesson_completed: 5,
  test_completed: 5,
  session_logged: 3,
  recording_created: 10,
  level_up: 2,
};

// ─── Daily Mission Bonus ───

export const DAILY_MISSION_BONUS_XP = 40;

// ─── Ranks ───

export interface RankDefinition {
  name: string;
  minXp: number;
}

export const RANKS: RankDefinition[] = [
  { name: "Beginner", minXp: 0 },
  { name: "Apprentice", minXp: 100 },
  { name: "Student", minXp: 300 },
  { name: "Musician", minXp: 750 },
  { name: "Performer", minXp: 1500 },
  { name: "Virtuoso", minXp: 3000 },
  { name: "Master", minXp: 6000 },
];

export function getRankForXp(xp: number): string {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXp) return RANKS[i].name;
  }
  return RANKS[0].name;
}

export function getNextRank(xp: number): RankDefinition | null {
  for (const rank of RANKS) {
    if (xp < rank.minXp) return rank;
  }
  return null;
}

// ─── Badge Definitions ───

export interface BadgeDefinition {
  id: BadgeId;
  title: string;
  description: string;
  icon: string;
  condition: (
    totalCounts: Record<GamificationEventType, number>,
    streakDays: number,
    totalXp: number
  ) => boolean;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // First-action badges
  {
    id: "first_exercise",
    title: "First Steps",
    description: "Complete your first exercise",
    icon: "pencil",
    condition: (c) => c.exercise_completed >= 1,
  },
  {
    id: "first_lesson",
    title: "Eager Learner",
    description: "Complete your first lesson",
    icon: "book-open",
    condition: (c) => c.lesson_completed >= 1,
  },
  {
    id: "first_test",
    title: "Test Taker",
    description: "Complete your first test",
    icon: "clipboard-check",
    condition: (c) => c.test_completed >= 1,
  },
  {
    id: "first_recording",
    title: "Sound Check",
    description: "Create your first recording",
    icon: "mic",
    condition: (c) => c.recording_created >= 1,
  },
  {
    id: "first_session",
    title: "Practice Makes Perfect",
    description: "Log your first practice session",
    icon: "calendar",
    condition: (c) => c.session_logged >= 1,
  },

  // Volume badges
  {
    id: "exercises_10",
    title: "Dedicated Practicer",
    description: "Complete 10 exercises",
    icon: "target",
    condition: (c) => c.exercise_completed >= 10,
  },
  {
    id: "exercises_50",
    title: "Exercise Machine",
    description: "Complete 50 exercises",
    icon: "zap",
    condition: (c) => c.exercise_completed >= 50,
  },
  {
    id: "lessons_5",
    title: "Knowledge Seeker",
    description: "Complete 5 lessons",
    icon: "graduation-cap",
    condition: (c) => c.lesson_completed >= 5,
  },
  {
    id: "lessons_10",
    title: "Scholar",
    description: "Complete 10 lessons",
    icon: "award",
    condition: (c) => c.lesson_completed >= 10,
  },

  // Streak badges
  {
    id: "streak_3",
    title: "Hat Trick",
    description: "Maintain a 3-day streak",
    icon: "flame",
    condition: (_c, streak) => streak >= 3,
  },
  {
    id: "streak_7",
    title: "Weekly Warrior",
    description: "Maintain a 7-day streak",
    icon: "flame",
    condition: (_c, streak) => streak >= 7,
  },
  {
    id: "streak_30",
    title: "Unstoppable",
    description: "Maintain a 30-day streak",
    icon: "flame",
    condition: (_c, streak) => streak >= 30,
  },

  // XP badges
  {
    id: "xp_500",
    title: "Rising Star",
    description: "Earn 500 XP",
    icon: "star",
    condition: (_c, _s, xp) => xp >= 500,
  },
  {
    id: "xp_2000",
    title: "Superstar",
    description: "Earn 2000 XP",
    icon: "trophy",
    condition: (_c, _s, xp) => xp >= 2000,
  },

  // Level badge
  {
    id: "level_up_first",
    title: "Level Up!",
    description: "Complete your first level",
    icon: "arrow-up-circle",
    condition: (c) => c.level_up >= 1,
  },
];

// ─── Empty Daily Counts ───

export function emptyDailyCounts(dayKey: string): DailyCounts {
  return {
    dayKey,
    exercise_completed: 0,
    lesson_completed: 0,
    level_up: 0,
    session_logged: 0,
    test_completed: 0,
    recording_created: 0,
  };
}

// ─── Empty Total Counts ───

export function emptyTotalCounts(): Record<GamificationEventType, number> {
  return {
    exercise_completed: 0,
    lesson_completed: 0,
    level_up: 0,
    session_logged: 0,
    test_completed: 0,
    recording_created: 0,
  };
}
