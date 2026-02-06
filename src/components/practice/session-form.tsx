"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, FileText, Music, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  createPracticeSession,
  updatePracticeSession,
  type CreatePracticeSessionData,
} from "@/lib/practice-service";
import type { Exercise, Level, PracticeSession } from "@/types/index";

// ─── Exercise type badge colors (matches exercise-card.tsx) ───

const TYPE_COLORS: Record<Exercise["type"], string> = {
  ear: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  rhythm: "bg-green-500/15 text-green-400 border-green-500/30",
  fretboard: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  theory: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  technique: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

// ─── Props ───

interface SessionFormProps {
  exercises: Exercise[];
  levels: Level[];
  /** If provided, form is in edit mode */
  session?: PracticeSession;
}

export function SessionForm({ exercises, levels, session }: SessionFormProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [date, setDate] = useState(
    session?.date ?? new Date().toISOString().slice(0, 10)
  );
  const [durationMinutes, setDurationMinutes] = useState(
    session?.durationMinutes ?? 30
  );
  const [notes, setNotes] = useState(session?.notes ?? "");
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>(
    session?.exerciseIds ?? []
  );
  const [levelId, setLevelId] = useState(session?.levelId ?? levels[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!session;

  function toggleExercise(exerciseId: string) {
    setSelectedExerciseIds((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    );
  }

  // Filter exercises by selected level
  const filteredExercises = levelId
    ? exercises.filter((ex) => ex.levelId === levelId)
    : exercises;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      setError("You must be signed in to log practice sessions.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const data: CreatePracticeSessionData = {
      date,
      durationMinutes,
      notes,
      exerciseIds: selectedExerciseIds,
      levelId,
    };

    try {
      if (isEditing && session) {
        await updatePracticeSession(user.uid, session.id, data);
        router.push(`/practice/${session.id}`);
      } else {
        await createPracticeSession(user.uid, data);
        router.push("/practice");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save session.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date + Duration row */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Date picker */}
        <div>
          <label
            htmlFor="session-date"
            className="mb-1.5 flex items-center gap-2 text-sm font-medium text-text-primary"
          >
            <Calendar className="h-4 w-4 text-accent-400" />
            Date
          </label>
          <input
            id="session-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
          />
        </div>

        {/* Duration */}
        <div>
          <label
            htmlFor="session-duration"
            className="mb-1.5 flex items-center gap-2 text-sm font-medium text-text-primary"
          >
            <Clock className="h-4 w-4 text-accent-400" />
            Duration (minutes)
          </label>
          <input
            id="session-duration"
            type="number"
            min={1}
            max={480}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            required
            className="w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
          />
        </div>
      </div>

      {/* Level selector */}
      <div>
        <label
          htmlFor="session-level"
          className="mb-1.5 flex items-center gap-2 text-sm font-medium text-text-primary"
        >
          <BookOpen className="h-4 w-4 text-accent-400" />
          Level
        </label>
        <select
          id="session-level"
          value={levelId}
          onChange={(e) => {
            setLevelId(e.target.value);
            // Clear exercise selections when level changes
            setSelectedExerciseIds([]);
          }}
          className="w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
        >
          {levels.map((level) => (
            <option key={level.id} value={level.id}>
              Level {level.order}: {level.title}
            </option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="session-notes"
          className="mb-1.5 flex items-center gap-2 text-sm font-medium text-text-primary"
        >
          <FileText className="h-4 w-4 text-accent-400" />
          Notes
        </label>
        <textarea
          id="session-notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did you work on? Any breakthroughs or challenges?"
          className="w-full resize-y rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
        />
      </div>

      {/* Exercise selector */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-text-primary">
          <Music className="h-4 w-4 text-accent-400" />
          Exercises Practiced
        </label>

        {filteredExercises.length === 0 ? (
          <p className="text-sm text-text-muted">
            No exercises available for the selected level.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {filteredExercises.map((exercise) => {
              const isSelected = selectedExerciseIds.includes(exercise.id);
              return (
                <button
                  key={exercise.id}
                  type="button"
                  onClick={() => toggleExercise(exercise.id)}
                  className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                    isSelected
                      ? "border-accent-500/50 bg-accent-500/10"
                      : "border-surface-600 bg-surface-800 hover:bg-surface-700"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      isSelected
                        ? "border-accent-500 bg-accent-500"
                        : "border-surface-600"
                    }`}
                  >
                    {isSelected && (
                      <svg className="h-3 w-3 text-surface-900" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-text-primary">{exercise.title}</span>
                    <span
                      className={`ml-2 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                        TYPE_COLORS[exercise.type]
                      }`}
                    >
                      {exercise.type}
                    </span>
                    {exercise.description && (
                      <p className="mt-0.5 text-xs text-text-muted line-clamp-1">
                        {exercise.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? isEditing
              ? "Saving..."
              : "Creating..."
            : isEditing
              ? "Save Changes"
              : "Log Practice Session"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(isEditing && session ? `/practice/${session.id}` : "/practice")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
