import { Mic, Play } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import type { Exercise } from "@/types/index";

const TYPE_COLORS: Record<Exercise["type"], string> = {
  ear: "bg-purple-500/15 text-purple-400",
  rhythm: "bg-green-500/15 text-green-400",
  fretboard: "bg-blue-500/15 text-blue-400",
  theory: "bg-amber-500/15 text-amber-400",
  technique: "bg-rose-500/15 text-rose-400",
};

interface ExerciseCardProps {
  exercise: Exercise;
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  return (
    <Card className="border border-surface-700 bg-surface-800 transition-colors hover:bg-surface-700/70">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base text-text-primary">
                {exercise.title}
              </CardTitle>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  TYPE_COLORS[exercise.type]
                }`}
              >
                {exercise.type}
              </span>
            </div>
            <CardDescription className="mt-1 text-sm text-text-secondary">
              {exercise.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {(exercise.requiresRecording || exercise.referenceAudioUrl) && (
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {exercise.requiresRecording && (
              <div className="flex items-center gap-2 rounded-lg bg-surface-700/50 px-3 py-2 text-xs text-text-muted">
                <Mic className="h-3.5 w-3.5 text-accent-400" />
                <span>
                  {exercise.recordingPrompt ?? "Recording required"}
                </span>
              </div>
            )}
            {exercise.referenceAudioUrl && (
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-surface-700/50 px-3 py-2 text-xs text-text-muted transition-colors hover:bg-surface-600"
                disabled
                title="Audio player coming in Phase 3"
              >
                <Play className="h-3.5 w-3.5 text-accent-400" />
                <span>Reference audio</span>
              </button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
