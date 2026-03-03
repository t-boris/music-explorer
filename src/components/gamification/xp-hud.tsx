"use client";

import Link from "next/link";
import { useGamificationHud } from "@/hooks/use-gamification-hud";
import { useAuth } from "@/hooks/use-auth";

export function XpHud() {
  const { user } = useAuth();
  const { totalXp, rank, streakDays, loading } = useGamificationHud();

  if (!user || loading) return null;

  return (
    <Link
      href="/progress"
      className="flex items-center gap-1.5 rounded-full border border-surface-700 bg-surface-800/80 px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent-500/40 hover:text-text-primary"
    >
      <span className="text-amber-400" title="XP">
        {totalXp} XP
      </span>
      <span className="text-text-muted">·</span>
      <span className="text-accent-400">{rank}</span>
      {streakDays > 0 && (
        <>
          <span className="text-text-muted">·</span>
          <span className="text-orange-400" title="Streak">
            {streakDays}d
          </span>
        </>
      )}
    </Link>
  );
}
