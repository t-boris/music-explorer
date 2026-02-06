import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";
import { WaveformVisualizer } from "@/components/interactive/waveform-visualizer";
import { FrequencyExplorer } from "@/components/interactive/frequency-explorer";
import { IntervalPlayer } from "@/components/interactive/interval-player";
import { FretboardDiagram } from "@/components/interactive/fretboard-diagram";
import { RhythmVisualizer } from "@/components/interactive/rhythm-visualizer";
import { MusicStory } from "@/components/content/music-story";
import { DigDeeper } from "@/components/content/dig-deeper-term";
import { OctaveExplainer } from "@/components/interactive/octave-explainer";
import { StaffComposer } from "@/components/interactive/staff-composer";
import { NoteValueChart } from "@/components/interactive/note-value-chart";
import { DottedNoteDemo } from "@/components/interactive/dotted-note-demo";
import { TieDemo } from "@/components/interactive/tie-demo";
import { MeterComparator } from "@/components/interactive/meter-comparator";

/**
 * Custom MDX component overrides for the dark theme.
 * Used with next-mdx-remote/rsc to render lesson theory content.
 *
 * Interactive components (WaveformVisualizer, FrequencyExplorer, etc.) are
 * "use client" components that hydrate as client islands within server-rendered MDX.
 */
export const mdxComponents: MDXComponents = {
  // Interactive learning components
  WaveformVisualizer,
  FrequencyExplorer,
  IntervalPlayer,
  FretboardDiagram,
  RhythmVisualizer,
  MusicStory,
  DigDeeper,
  OctaveExplainer,
  StaffComposer,
  NoteValueChart,
  DottedNoteDemo,
  TieDemo,
  MeterComparator,

  // Headings
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <h1
      className="mb-4 mt-8 font-heading text-2xl font-bold text-accent-400 first:mt-0 sm:text-3xl"
      {...props}
    />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="mb-3 mt-8 font-heading text-xl font-semibold text-text-primary sm:text-2xl"
      {...props}
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3
      className="mb-2 mt-6 font-heading text-lg font-semibold text-text-primary"
      {...props}
    />
  ),

  // Body text
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p
      className="mb-4 font-body leading-7 text-text-secondary"
      {...props}
    />
  ),

  // Strong / emphasis
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-text-primary" {...props} />
  ),
  em: (props: ComponentPropsWithoutRef<"em">) => (
    <em className="text-text-secondary" {...props} />
  ),

  // Links
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a
      className="text-accent-400 underline decoration-accent-400/30 underline-offset-2 transition-colors hover:text-accent-500 hover:decoration-accent-500/50"
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    />
  ),

  // Lists
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className="mb-4 ml-6 list-disc space-y-1 text-text-secondary marker:text-accent-400/60"
      {...props}
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="mb-4 ml-6 list-decimal space-y-1 text-text-secondary marker:text-accent-400/60"
      {...props}
    />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="leading-7" {...props} />
  ),

  // Blockquote
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="mb-4 border-l-4 border-accent-500/40 bg-surface-800 py-3 pl-4 pr-4 text-text-secondary [&>p]:mb-0"
      {...props}
    />
  ),

  // Code
  code: (props: ComponentPropsWithoutRef<"code">) => {
    // Inline code (not inside a pre)
    return (
      <code
        className="rounded bg-surface-700 px-1.5 py-0.5 font-mono text-sm text-accent-400"
        {...props}
      />
    );
  },
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="mb-4 overflow-x-auto rounded-lg border border-surface-700 bg-surface-800 p-4 font-mono text-sm leading-6 text-text-secondary [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-inherit"
      {...props}
    />
  ),

  // Table
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="mb-4 overflow-x-auto">
      <table
        className="w-full border-collapse text-sm text-text-secondary"
        {...props}
      />
    </div>
  ),
  thead: (props: ComponentPropsWithoutRef<"thead">) => (
    <thead className="bg-surface-700 text-text-primary" {...props} />
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      className="border border-surface-600 px-3 py-2 text-left font-semibold"
      {...props}
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td className="border border-surface-700 px-3 py-2" {...props} />
  ),
  tr: (props: ComponentPropsWithoutRef<"tr">) => (
    <tr className="even:bg-surface-800/50" {...props} />
  ),

  // Horizontal rule
  hr: (props: ComponentPropsWithoutRef<"hr">) => (
    <hr className="my-8 border-surface-700" {...props} />
  ),
};
