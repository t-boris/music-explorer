"use client";

import { Mic, Loader2 } from "lucide-react";
import { RecordingItem } from "@/components/recording/recording-item";
import { useRecordings } from "@/hooks/use-recordings";

interface QuickRecordingListProps {
  userId: string;
}

export function QuickRecordingList({ userId }: QuickRecordingListProps) {
  const { recordings, loading } = useRecordings(userId, "free", "dashboard-quick");

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-text-muted py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading quick recordings...
      </div>
    );
  }

  if (recordings.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-heading text-text-secondary">
        <Mic className="h-5 w-5 text-red-400" />
        Quick Recordings
      </h2>
      <div className="space-y-2">
        {recordings.map((recording) => (
          <RecordingItem
            key={recording.id}
            recording={recording}
            userId={userId}
            showDate
          />
        ))}
      </div>
    </section>
  );
}
