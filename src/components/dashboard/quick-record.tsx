"use client";

import { Mic } from "lucide-react";
import { AudioRecorder } from "@/components/recording/audio-recorder";

interface QuickRecordProps {
  userId: string;
}

export function QuickRecord({ userId }: QuickRecordProps) {
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
    </div>
  );
}
