"use client";

import { Mic, Loader2 } from "lucide-react";
import { AudioRecorder } from "@/components/recording/audio-recorder";
import { RecordingItem } from "@/components/recording/recording-item";
import { useRecordings } from "@/hooks/use-recordings";

interface QuickRecordProps {
  userId: string;
}

export function QuickRecord({ userId }: QuickRecordProps) {
  const { recordings, loading } = useRecordings(userId, "free", "dashboard-quick");

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-heading text-text-primary">
        <Mic className="h-5 w-5 text-red-400" />
        Quick Record
      </h2>

      <p className="mb-4 text-xs text-text-muted">
        Capture an idea or practice take without starting a full session.
      </p>

      <AudioRecorder
        userId={userId}
        contextType="free"
        contextId="dashboard-quick"
        contextTitle="Quick recording"
        levelId=""
      />

      {/* Recent quick recordings */}
      {loading ? (
        <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading recordings...
        </div>
      ) : recordings.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-text-muted">
            Recent Recordings ({recordings.length})
          </p>
          {recordings.map((recording) => (
            <RecordingItem
              key={recording.id}
              recording={recording}
              userId={userId}
              showDate
            />
          ))}
        </div>
      )}
    </div>
  );
}
