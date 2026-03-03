"use client";

import { CheckCircle2, Circle, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DailyMission } from "@/types/index";

interface DailyMissionsProps {
  missions: DailyMission[];
  allComplete: boolean;
  onClaimBonus: () => Promise<number>;
}

export function DailyMissions({
  missions,
  allComplete,
  onClaimBonus,
}: DailyMissionsProps) {
  if (missions.length === 0) return null;

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-heading text-text-primary">
        <Gift className="h-5 w-5 text-purple-400" />
        Daily Missions
      </h2>

      <div className="space-y-3">
        {missions.map((mission) => (
          <div key={mission.id} className="flex items-center gap-3">
            {mission.completed ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
            ) : (
              <Circle className="h-5 w-5 shrink-0 text-text-muted" />
            )}

            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-medium ${
                  mission.completed
                    ? "text-text-muted line-through"
                    : "text-text-primary"
                }`}
              >
                {mission.title}
              </p>

              {/* Progress bar */}
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-surface-700">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      mission.completed ? "bg-green-500" : "bg-accent-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        (mission.current / mission.target) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <span className="shrink-0 text-xs text-text-muted">
                  {mission.current}/{mission.target}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {allComplete && (
        <Button
          onClick={() => onClaimBonus()}
          className="mt-4 w-full bg-purple-600 text-white hover:bg-purple-500"
          size="sm"
        >
          Claim +40 XP Bonus
        </Button>
      )}
    </div>
  );
}
