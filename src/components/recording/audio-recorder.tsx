"use client";

import { useState } from "react";
import { Mic, Square, X, Save, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { uploadRecording } from "@/lib/recording-service";
import { RecordingPlayer } from "@/components/recording/recording-player";
import type { Recording } from "@/types/index";

interface AudioRecorderProps {
  userId: string;
  contextType: Recording["contextType"];
  contextId: string;
  contextTitle: string;
  levelId: string;
  sessionId?: string;
  onRecordingSaved?: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function AudioRecorder({
  userId,
  contextType,
  contextId,
  contextTitle,
  levelId,
  sessionId,
  onRecordingSaved,
}: AudioRecorderProps) {
  const {
    isRecording,
    duration,
    audioBlob,
    error,
    permissionStatus,
    startRecording,
    stopRecording,
    cancelRecording,
    clearRecording,
  } = useAudioRecorder();

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Create preview URL when blob is available
  const blobUrl =
    audioBlob && !previewUrl
      ? (() => {
          const url = URL.createObjectURL(audioBlob);
          setPreviewUrl(url);
          return url;
        })()
      : previewUrl;

  async function handleSave() {
    if (!audioBlob) return;

    setSaving(true);
    setSaveError(null);

    try {
      await uploadRecording(userId, audioBlob, {
        duration,
        contextType,
        contextId,
        contextTitle,
        levelId,
        sessionId,
      });

      // Clean up
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      clearRecording();
      onRecordingSaved?.();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save recording."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    clearRecording();
    setSaveError(null);
  }

  // Error / unsupported state
  if (permissionStatus === "unsupported") {
    return (
      <div className="rounded-xl border border-surface-700 bg-surface-800 p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-text-muted" />
        <p className="mt-2 text-sm text-text-muted">
          Recording is not supported in this browser.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-6">
      <AnimatePresence mode="wait">
        {/* ─── Idle State: Record Button ─── */}
        {!isRecording && !audioBlob && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-4"
          >
            {/* Permission denied hint */}
            {permissionStatus === "denied" && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Microphone access denied. Check browser settings.
              </div>
            )}

            {error && permissionStatus !== "denied" && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={startRecording}
              className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-all hover:bg-red-500 hover:shadow-red-600/25 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-surface-800"
            >
              <Mic className="h-6 w-6" />
            </button>

            <p className="text-xs text-text-muted">Tap to record</p>
          </motion.div>
        )}

        {/* ─── Recording State ─── */}
        {isRecording && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-4"
          >
            {/* Pulsing record indicator */}
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full bg-red-500/30"
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <button
                onClick={stopRecording}
                className="relative flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30"
              >
                <Square className="h-5 w-5" />
              </button>
            </div>

            {/* Timer */}
            <span className="font-mono text-2xl text-text-primary">
              {formatDuration(duration)}
            </span>

            {/* Cancel */}
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelRecording}
              className="text-text-muted hover:text-red-400"
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Cancel
            </Button>
          </motion.div>
        )}

        {/* ─── Preview State ─── */}
        {!isRecording && audioBlob && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-4"
          >
            <p className="text-center text-xs font-medium text-text-muted">
              Preview your recording
            </p>

            {blobUrl && (
              <RecordingPlayer
                downloadUrl={blobUrl}
                duration={duration}
                compact
              />
            )}

            {saveError && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {saveError}
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDiscard}
                disabled={saving}
                className="text-text-muted hover:text-red-400"
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Discard
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="bg-accent-500 text-surface-900 hover:bg-accent-400"
              >
                <Save className="mr-1 h-3.5 w-3.5" />
                {saving ? "Saving..." : "Save Recording"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
