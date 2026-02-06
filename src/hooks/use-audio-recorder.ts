"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type PermissionStatus = "prompt" | "granted" | "denied" | "unsupported";

export interface UseAudioRecorderState {
  isRecording: boolean;
  duration: number;
  audioBlob: Blob | null;
  error: string | null;
  permissionStatus: PermissionStatus;
}

export interface UseAudioRecorderActions {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  cancelRecording: () => void;
  clearRecording: () => void;
}

export type UseAudioRecorderReturn = UseAudioRecorderState &
  UseAudioRecorderActions;

/**
 * Determine the best supported audio mimeType for MediaRecorder.
 * Prefers WebM/Opus, falls back to plain WebM, then audio/mp4 (Safari).
 */
function getSupportedMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;

  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
  ];

  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }

  return undefined;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>("prompt");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Clean up all resources
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startRecording = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    setDuration(0);

    // Check MediaRecorder support
    if (
      typeof window === "undefined" ||
      typeof navigator.mediaDevices === "undefined" ||
      typeof MediaRecorder === "undefined"
    ) {
      setPermissionStatus("unsupported");
      setError("Recording is not supported in this browser.");
      return;
    }

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      setPermissionStatus("unsupported");
      setError("No supported audio format found in this browser.");
      return;
    }

    // Request microphone access
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionStatus("granted");
    } catch (err) {
      setPermissionStatus("denied");
      setError(
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone access denied. Please allow microphone access in your browser settings."
          : "Could not access microphone."
      );
      return;
    }

    streamRef.current = stream;
    chunksRef.current = [];

    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      setAudioBlob(blob);
      setIsRecording(false);

      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };

    recorder.onerror = () => {
      setError("Recording failed unexpectedly.");
      setIsRecording(false);
      cleanup();
    };

    recorder.start(1000); // Collect data every second
    setIsRecording(true);
    startTimeRef.current = Date.now();

    // Duration timer
    timerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 250);
  }, [cleanup]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Capture final duration
    if (startTimeRef.current > 0) {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const cancelRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Discard chunks before stopping so onstop produces an empty blob
    chunksRef.current = [];
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setAudioBlob(null);
    setDuration(0);
    setIsRecording(false);
    cleanup();
  }, [cleanup]);

  const clearRecording = useCallback(() => {
    setAudioBlob(null);
    setDuration(0);
    setError(null);
  }, []);

  return {
    isRecording,
    duration,
    audioBlob,
    error,
    permissionStatus,
    startRecording,
    stopRecording,
    cancelRecording,
    clearRecording,
  };
}
