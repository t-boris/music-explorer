"use client";

import { useCallback, useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { InviteLink } from "@/types/index";

interface ShareSettingsProps {
  inviteLink: InviteLink | null;
  loading: boolean;
  onGenerate: () => Promise<void>;
}

export function ShareSettings({
  inviteLink,
  loading,
  onGenerate,
}: ShareSettingsProps) {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fullUrl =
    typeof window !== "undefined" && inviteLink
      ? `${window.location.origin}/invite/${inviteLink.code}`
      : "";

  const handleCopy = useCallback(async () => {
    if (!fullUrl) return;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [fullUrl]);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      await onGenerate();
    } finally {
      setGenerating(false);
    }
  }, [onGenerate]);

  return (
    <Card className="border-border bg-surface-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-text-primary">
          <Link2 className="h-5 w-5 text-accent-400" />
          Invite Link
        </CardTitle>
        <CardDescription className="text-text-muted">
          Share this link with teachers or friends to let them view your
          dashboard and progress.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-10 animate-pulse rounded bg-surface-700" />
        ) : inviteLink ? (
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-surface-900 px-3 py-2 text-sm text-accent-400">
              {fullUrl}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">
                {copied ? "Copied" : "Copy link"}
              </span>
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full"
          >
            {generating ? "Generating..." : "Generate Invite Link"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
