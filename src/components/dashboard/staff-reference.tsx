"use client";

import { Music } from "lucide-react";

// ─── SVG Layout ───

const LINE_SPACING = 16;
const HALF_SPACE = LINE_SPACING / 2;
const PAD_TOP = 28;
const PAD_LEFT = 16;
const CLEF_WIDTH = 44;
const STAFF_WIDTH = 280;
const SVG_WIDTH = PAD_LEFT + STAFF_WIDTH;
const SVG_HEIGHT = PAD_TOP + 4 * LINE_SPACING + 24;

// ─── Note positions for treble clef ───

interface MnemonicNote {
  name: string;
  word: string;
  stepsFromBottom: number;
  type: "line" | "space";
}

const LINE_NOTES: MnemonicNote[] = [
  { name: "E", word: "Every", stepsFromBottom: 0, type: "line" },
  { name: "G", word: "Good", stepsFromBottom: 2, type: "line" },
  { name: "B", word: "Boy", stepsFromBottom: 4, type: "line" },
  { name: "D", word: "Does", stepsFromBottom: 6, type: "line" },
  { name: "F", word: "Fine", stepsFromBottom: 8, type: "line" },
];

const SPACE_NOTES: MnemonicNote[] = [
  { name: "F", word: "F", stepsFromBottom: 1, type: "space" },
  { name: "A", word: "A", stepsFromBottom: 3, type: "space" },
  { name: "C", word: "C", stepsFromBottom: 5, type: "space" },
  { name: "E", word: "E", stepsFromBottom: 7, type: "space" },
];

function stepsToY(steps: number): number {
  return PAD_TOP + 4 * LINE_SPACING - steps * HALF_SPACE;
}

// ─── Component ───

export function StaffReference() {
  const noteStartX = PAD_LEFT + CLEF_WIDTH + 12;
  const lineSpacing = (STAFF_WIDTH - CLEF_WIDTH - 24) / 5; // 5 line notes
  const spaceStartX = noteStartX;
  const spaceSpacing = lineSpacing;

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-6">
      <h2 className="mb-4 flex items-center gap-2 font-heading text-lg text-text-primary">
        <Music className="h-5 w-5 text-accent-400" />
        Staff Quick Reference
      </h2>

      {/* Lines mnemonic */}
      <div className="mb-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
            Lines
          </span>
          <span className="text-xs text-text-muted">
            Every Good Boy Does Fine
          </span>
        </div>

        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="max-w-full"
        >
          {/* Staff lines */}
          {Array.from({ length: 5 }, (_, i) => (
            <line
              key={`line-${i}`}
              x1={PAD_LEFT}
              y1={PAD_TOP + i * LINE_SPACING}
              x2={PAD_LEFT + STAFF_WIDTH - 16}
              y2={PAD_TOP + i * LINE_SPACING}
              stroke="oklch(40% 0.02 250)"
              strokeWidth={1}
            />
          ))}

          {/* Treble clef */}
          <text
            x={PAD_LEFT + 4}
            y={PAD_TOP + 3.65 * LINE_SPACING}
            fontSize={58}
            fontFamily="serif"
            fill="oklch(55% 0.02 250)"
          >
            {"\u{1D11E}"}
          </text>

          {/* Line notes with noteheads */}
          {LINE_NOTES.map((note, i) => {
            const cx = noteStartX + i * lineSpacing;
            const cy = stepsToY(note.stepsFromBottom);
            return (
              <g key={note.word}>
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={7}
                  ry={5.5}
                  fill="oklch(75% 0.15 65)"
                  transform={`rotate(-10 ${cx} ${cy})`}
                />
                <text
                  x={cx}
                  y={cy + 3.5}
                  textAnchor="middle"
                  fill="oklch(15% 0.01 250)"
                  fontSize={8}
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {note.name}
                </text>
                <text
                  x={cx}
                  y={PAD_TOP + 4 * LINE_SPACING + 18}
                  textAnchor="middle"
                  fill="oklch(60% 0.08 65)"
                  fontSize={9}
                  fontFamily="monospace"
                >
                  {note.word}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Spaces mnemonic */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-xs font-medium text-purple-400">
            Spaces
          </span>
          <span className="text-xs text-text-muted">F - A - C - E</span>
        </div>

        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="max-w-full"
        >
          {/* Staff lines */}
          {Array.from({ length: 5 }, (_, i) => (
            <line
              key={`line-${i}`}
              x1={PAD_LEFT}
              y1={PAD_TOP + i * LINE_SPACING}
              x2={PAD_LEFT + STAFF_WIDTH - 16}
              y2={PAD_TOP + i * LINE_SPACING}
              stroke="oklch(40% 0.02 250)"
              strokeWidth={1}
            />
          ))}

          {/* Treble clef */}
          <text
            x={PAD_LEFT + 4}
            y={PAD_TOP + 3.65 * LINE_SPACING}
            fontSize={58}
            fontFamily="serif"
            fill="oklch(55% 0.02 250)"
          >
            {"\u{1D11E}"}
          </text>

          {/* Space notes with noteheads */}
          {SPACE_NOTES.map((note, i) => {
            const cx = spaceStartX + i * spaceSpacing + spaceSpacing / 2;
            const cy = stepsToY(note.stepsFromBottom);
            return (
              <g key={`${note.name}-${note.stepsFromBottom}`}>
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={7}
                  ry={5.5}
                  fill="oklch(75% 0.15 290)"
                  transform={`rotate(-10 ${cx} ${cy})`}
                />
                <text
                  x={cx}
                  y={cy + 3.5}
                  textAnchor="middle"
                  fill="oklch(15% 0.01 250)"
                  fontSize={8}
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {note.name}
                </text>
                <text
                  x={cx}
                  y={PAD_TOP + 4 * LINE_SPACING + 18}
                  textAnchor="middle"
                  fill="oklch(60% 0.08 290)"
                  fontSize={9}
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {note.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
