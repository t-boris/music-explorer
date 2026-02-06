"use client";

import { Disc3, Lightbulb } from "lucide-react";
import type { ReactNode } from "react";

interface MusicStoryProps {
  title: string;
  era?: string;
  connection: string;
  children: ReactNode;
}

/**
 * A visually distinctive "From the Stage" story card for lesson MDX content.
 * Renders a music history anecdote connecting theory concepts to real moments
 * in music history.
 */
export function MusicStory({
  title,
  era,
  connection,
  children,
}: MusicStoryProps) {
  return (
    <div className="relative my-8 overflow-hidden rounded-lg border-l-4 border-l-amber-500 bg-surface-800/80 backdrop-blur">
      {/* Subtle gradient overlay for warmth */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5" />

      {/* Header */}
      <div className="relative flex items-start gap-3 border-b border-surface-700/50 px-5 py-4">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
          <Disc3 className="h-4 w-4 text-amber-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-lg font-semibold leading-tight text-text-primary">
            {title}
          </h3>
          {era && (
            <span className="mt-1 inline-block rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-400">
              {era}
            </span>
          )}
        </div>
      </div>

      {/* Story body */}
      <div className="relative px-5 py-4 [&>p:last-child]:mb-0">{children}</div>

      {/* Why this matters footer */}
      <div className="relative border-t border-surface-700/50 px-5 py-3">
        <div className="flex items-start gap-2">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-400/70" />
          <p className="text-sm italic leading-relaxed text-text-secondary/80">
            {connection}
          </p>
        </div>
      </div>
    </div>
  );
}
