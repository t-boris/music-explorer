"use client";

import { useState, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { RecordingPlayer } from "@/components/recording/recording-player";
import type { Recording } from "@/types/index";

interface RecordingComparisonProps {
  recordings: Recording[];
}

function formatComparisonDate(recording: Recording): string {
  if (!recording.createdAt) return "Unknown date";
  const date =
    "toDate" in recording.createdAt
      ? recording.createdAt.toDate()
      : new Date(recording.createdAt as unknown as string);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysBetween(a: Date, b: Date): number {
  const diff = Math.abs(b.getTime() - a.getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function RecordingComparison({
  recordings,
}: RecordingComparisonProps) {
  // Sort oldest first for comparison
  const sorted = useMemo(
    () =>
      [...recordings].sort((a, b) => {
        const aTime =
          a.createdAt && "toDate" in a.createdAt
            ? a.createdAt.toDate().getTime()
            : 0;
        const bTime =
          b.createdAt && "toDate" in b.createdAt
            ? b.createdAt.toDate().getTime()
            : 0;
        return aTime - bTime;
      }),
    [recordings]
  );

  const [leftIdx, setLeftIdx] = useState(0);
  const [rightIdx, setRightIdx] = useState(Math.min(1, sorted.length - 1));

  if (sorted.length < 2) return null;

  const leftRec = sorted[leftIdx];
  const rightRec = sorted[rightIdx];

  const leftDate =
    leftRec.createdAt && "toDate" in leftRec.createdAt
      ? leftRec.createdAt.toDate()
      : new Date();
  const rightDate =
    rightRec.createdAt && "toDate" in rightRec.createdAt
      ? rightRec.createdAt.toDate()
      : new Date();
  const gap = daysBetween(leftDate, rightDate);

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-5">
      <h3 className="mb-4 text-sm font-medium text-text-secondary">
        Compare Recordings
      </h3>

      <div className="space-y-4">
        {/* Version A */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-accent-400">
              Version {leftIdx + 1} ({formatComparisonDate(leftRec)})
            </span>
            {sorted.length > 2 && (
              <select
                value={leftIdx}
                onChange={(e) => setLeftIdx(Number(e.target.value))}
                className="rounded border border-surface-600 bg-surface-700 px-2 py-1 text-xs text-text-secondary"
              >
                {sorted.map((_, i) => (
                  <option key={i} value={i} disabled={i === rightIdx}>
                    Recording {i + 1}
                  </option>
                ))}
              </select>
            )}
          </div>
          <RecordingPlayer
            downloadUrl={leftRec.downloadUrl}
            duration={leftRec.duration}
            compact
          />
        </div>

        {/* Gap indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
          <div className="h-px flex-1 bg-surface-600" />
          <ArrowRight className="h-3 w-3" />
          <span>
            {gap === 0 ? "Same day" : `${gap} day${gap === 1 ? "" : "s"} later`}
          </span>
          <div className="h-px flex-1 bg-surface-600" />
        </div>

        {/* Version B */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-accent-400">
              Version {rightIdx + 1} ({formatComparisonDate(rightRec)})
            </span>
            {sorted.length > 2 && (
              <select
                value={rightIdx}
                onChange={(e) => setRightIdx(Number(e.target.value))}
                className="rounded border border-surface-600 bg-surface-700 px-2 py-1 text-xs text-text-secondary"
              >
                {sorted.map((_, i) => (
                  <option key={i} value={i} disabled={i === leftIdx}>
                    Recording {i + 1}
                  </option>
                ))}
              </select>
            )}
          </div>
          <RecordingPlayer
            downloadUrl={rightRec.downloadUrl}
            duration={rightRec.duration}
            compact
          />
        </div>
      </div>
    </div>
  );
}
