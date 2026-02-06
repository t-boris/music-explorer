"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Crosshair } from "lucide-react";
import type { ProgressSummary, SkillType } from "@/types/index";

const SKILL_LABELS: Record<SkillType, string> = {
  rhythm: "Rhythm",
  intervals: "Intervals",
  chords: "Chords",
  fretboard: "Fretboard",
  technique: "Technique",
  ear: "Ear",
};

const SKILL_ORDER: SkillType[] = [
  "rhythm",
  "intervals",
  "chords",
  "fretboard",
  "technique",
  "ear",
];

interface SkillRadarProps {
  progressSummary: ProgressSummary | null;
}

export function SkillRadar({ progressSummary }: SkillRadarProps) {
  const hasScores =
    progressSummary &&
    SKILL_ORDER.some((skill) => progressSummary[skill]?.score > 0);

  const data = SKILL_ORDER.map((skill) => ({
    skill: SKILL_LABELS[skill],
    score: progressSummary?.[skill]?.score ?? 0,
    fullMark: 100,
  }));

  if (!hasScores) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-surface-700 bg-surface-800 p-8 text-center">
        <Crosshair className="mb-3 h-10 w-10 text-accent-400/50" />
        <h3 className="text-lg font-heading text-text-primary">
          Skill Radar
        </h3>
        <p className="mt-2 max-w-xs text-sm text-text-secondary">
          Start practicing to see your skills! Complete exercises and tests to
          build your radar chart.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-4 sm:p-6">
      <h3 className="mb-4 text-lg font-heading text-text-primary">
        Skill Radar
      </h3>
      <div className="h-[280px] w-full sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid
              stroke="oklch(25% 0.015 250)"
              strokeDasharray="3 3"
            />
            <PolarAngleAxis
              dataKey="skill"
              tick={{
                fill: "oklch(70% 0.02 250)",
                fontSize: 12,
                fontFamily: "var(--font-body)",
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{
                fill: "oklch(50% 0.02 250)",
                fontSize: 10,
              }}
              tickCount={5}
              axisLine={false}
            />
            <Radar
              name="Skills"
              dataKey="score"
              stroke="oklch(70% 0.18 55)"
              fill="oklch(75% 0.15 65)"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
