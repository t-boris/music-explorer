"use client";

import {
  Pencil,
  BookOpen,
  ClipboardCheck,
  Mic,
  Calendar,
  Target,
  Zap,
  GraduationCap,
  Award,
  Flame,
  Star,
  Trophy,
  ArrowUpCircle,
} from "lucide-react";
import { BADGE_DEFINITIONS } from "@/lib/gamification-config";
import type { Badge, BadgeId } from "@/types/index";

// Map icon string → Lucide component
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  pencil: Pencil,
  "book-open": BookOpen,
  "clipboard-check": ClipboardCheck,
  mic: Mic,
  calendar: Calendar,
  target: Target,
  zap: Zap,
  "graduation-cap": GraduationCap,
  award: Award,
  flame: Flame,
  star: Star,
  trophy: Trophy,
  "arrow-up-circle": ArrowUpCircle,
};

interface BadgeGridProps {
  earnedBadges: Badge[];
}

export function BadgeGrid({ earnedBadges }: BadgeGridProps) {
  const earnedIds = new Set<BadgeId>(earnedBadges.map((b) => b.id));

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-6">
      <h2 className="mb-4 text-lg font-heading text-text-primary">Badges</h2>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {BADGE_DEFINITIONS.map((def) => {
          const earned = earnedIds.has(def.id);
          const Icon = ICON_MAP[def.icon] ?? Star;

          return (
            <div
              key={def.id}
              className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors ${
                earned
                  ? "border-accent-500/30 bg-accent-500/5"
                  : "border-surface-700 bg-surface-900/50 opacity-40"
              }`}
              title={earned ? `${def.title}: ${def.description}` : def.description}
            >
              <Icon
                className={`h-6 w-6 ${
                  earned ? "text-accent-400" : "text-text-muted"
                }`}
              />
              <span
                className={`text-[11px] font-medium leading-tight ${
                  earned ? "text-text-primary" : "text-text-muted"
                }`}
              >
                {def.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
