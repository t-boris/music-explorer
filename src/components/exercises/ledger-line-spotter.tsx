"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { ExerciseExplanation } from "@/components/exercises/exercise-explanation";

// ─── Types ───

interface LedgerLineSpotterProps {
  onComplete: () => void;
  completed: boolean;
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
}

// ─── Note Data ───

interface NotePosition {
  name: string;
  midi: number;
  stepsFromBottom: number;
}

// All treble clef positions including ledger lines
const ALL_POSITIONS: NotePosition[] = [
  { name: "C4", midi: 60, stepsFromBottom: -2 },
  { name: "D4", midi: 62, stepsFromBottom: -1 },
  { name: "E4", midi: 64, stepsFromBottom: 0 },
  { name: "F4", midi: 65, stepsFromBottom: 1 },
  { name: "G4", midi: 67, stepsFromBottom: 2 },
  { name: "A4", midi: 69, stepsFromBottom: 3 },
  { name: "B4", midi: 71, stepsFromBottom: 4 },
  { name: "C5", midi: 72, stepsFromBottom: 5 },
  { name: "D5", midi: 74, stepsFromBottom: 6 },
  { name: "E5", midi: 76, stepsFromBottom: 7 },
  { name: "F5", midi: 77, stepsFromBottom: 8 },
  { name: "G5", midi: 79, stepsFromBottom: 9 },
  { name: "A5", midi: 81, stepsFromBottom: 10 },
];

// Focus on ledger line notes and notes near them
const LEDGER_FOCUS_NOTES = ALL_POSITIONS.filter(
  (n) => n.stepsFromBottom <= 0 || n.stepsFromBottom >= 8
);

const REQUIRED_STREAK = 3;

// ─── SVG Layout ───

const LINE_SPACING = 14;
const HALF_SPACE = LINE_SPACING / 2;
const PAD_TOP = 36;
const PAD_BOTTOM = 36;
const PAD_LEFT = 20;
const CLEF_WIDTH = 46;
const CLICK_AREA_WIDTH = 80;
const SVG_WIDTH = PAD_LEFT + CLEF_WIDTH + CLICK_AREA_WIDTH + 20;
const SVG_HEIGHT = PAD_TOP + 4 * LINE_SPACING + PAD_BOTTOM;

// ─── Helpers ───

function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function stepsToY(steps: number): number {
  return PAD_TOP + 4 * LINE_SPACING - steps * HALF_SPACE;
}

function getLedgerLineYs(steps: number): number[] {
  const ys: number[] = [];
  if (steps <= -2) {
    for (let s = -2; s >= steps; s -= 2) ys.push(stepsToY(s));
  }
  if (steps >= 10) {
    for (let s = 10; s <= steps; s += 2) ys.push(stepsToY(s));
  }
  return ys;
}

function pickRandom<T>(arr: T[], exclude?: T): T {
  const filtered = exclude !== undefined ? arr.filter((x) => x !== exclude) : arr;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

// ─── Component ───

export function LedgerLineSpotter({
  onComplete,
  completed,
  lessonTitle,
  levelTitle,
  levelOrder,
}: LedgerLineSpotterProps) {
  const [done, setDone] = useState(completed);
  const [targetNote, setTargetNote] = useState<NotePosition>(
    () => pickRandom(LEDGER_FOCUS_NOTES)
  );
  const [streak, setStreak] = useState(0);
  const [hoverSteps, setHoverSteps] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    steps: number;
    correct: boolean;
  } | null>(null);
  const [explanation, setExplanation] = useState<{
    question: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  } | null>(null);
  const completedRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback(
    (midi: number) => {
      const ctx = getAudioContext();
      const freq = midiToFrequency(midi);
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
      gain.gain.setValueAtTime(0.3, now + 0.35);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    },
    [getAudioContext]
  );

  const noteX = PAD_LEFT + CLEF_WIDTH + CLICK_AREA_WIDTH / 2;

  const findNearestPosition = (svgY: number): NotePosition | null => {
    let closest: NotePosition | null = null;
    let minDist = Infinity;

    for (const pos of ALL_POSITIONS) {
      const posY = stepsToY(pos.stepsFromBottom);
      const dist = Math.abs(svgY - posY);
      if (dist < minDist) {
        minDist = dist;
        closest = pos;
      }
    }

    if (minDist > HALF_SPACE + 2) return null;
    return closest;
  };

  const nextRound = useCallback(() => {
    const next = pickRandom(LEDGER_FOCUS_NOTES, targetNote);
    setTargetNote(next);
    setFeedback(null);
    setHoverSteps(null);
  }, [targetNote]);

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      if (feedback || done) return;

      const svg = e.currentTarget.ownerSVGElement;
      if (!svg) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());

      const clicked = findNearestPosition(svgPt.y);
      if (!clicked) return;

      playTone(clicked.midi);

      const isCorrect = clicked.stepsFromBottom === targetNote.stepsFromBottom;

      setFeedback({ steps: clicked.stepsFromBottom, correct: isCorrect });

      const posDesc = (pos: NotePosition) => {
        if (pos.stepsFromBottom < 0) return "ledger line(s) below the staff";
        if (pos.stepsFromBottom > 8) return "ledger line(s) above the staff";
        return pos.stepsFromBottom % 2 === 0
          ? `line ${Math.floor(pos.stepsFromBottom / 2) + 1}`
          : `space ${Math.floor(pos.stepsFromBottom / 2) + 1}`;
      };

      setExplanation({
        question: `Place ${targetNote.name} on the treble clef staff`,
        studentAnswer: `${clicked.name} (${posDesc(clicked)})`,
        correctAnswer: `${targetNote.name} is on ${posDesc(targetNote)}`,
        isCorrect,
      });

      if (isCorrect) {
        const newStreak = streak + 1;
        setStreak(newStreak);

        if (newStreak >= REQUIRED_STREAK && !completedRef.current) {
          completedRef.current = true;
          setTimeout(() => {
            setDone(true);
            onComplete();
          }, 1200);
        } else {
          setTimeout(nextRound, 1200);
        }
      } else {
        setStreak(0);
        setTimeout(nextRound, 2000);
      }
    },
    [feedback, done, targetNote, playTone, streak, onComplete, nextRound]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      if (feedback) return;
      const svg = e.currentTarget.ownerSVGElement;
      if (!svg) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());

      const nearest = findNearestPosition(svgPt.y);
      setHoverSteps(nearest?.stepsFromBottom ?? null);
    },
    [feedback]
  );

  // Get ledger lines for hover ghost or feedback
  const feedbackY = feedback !== null ? stepsToY(feedback.steps) : null;
  const feedbackLedgerYs = feedback !== null ? getLedgerLineYs(feedback.steps) : [];
  const hoverY = hoverSteps !== null ? stepsToY(hoverSteps) : null;
  const hoverLedgerYs = hoverSteps !== null ? getLedgerLineYs(hoverSteps) : [];

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-4">
      <h3 className="mb-1 text-sm font-semibold text-text-primary">
        Place the Note
      </h3>
      <p className="mb-3 text-xs text-text-muted">
        Click the correct position on the staff for the note shown. Get{" "}
        {REQUIRED_STREAK} in a row to complete.
      </p>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-2 py-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-surface-900">
              <Check className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-green-400">
              Ledger lines mastered!
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Target note display */}
            <div className="mb-3 flex justify-center">
              <motion.div
                key={targetNote.name}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-accent-500/30 bg-accent-500/10 px-5 py-2"
              >
                <span className="text-xs text-text-muted">Place: </span>
                <span className="font-mono text-lg font-bold text-accent-400">
                  {targetNote.name}
                </span>
              </motion.div>
            </div>

            {/* Staff to click on */}
            <div className="mb-3 flex justify-center">
              <svg
                width={SVG_WIDTH}
                height={SVG_HEIGHT}
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              >
                {/* Staff lines */}
                {Array.from({ length: 5 }, (_, i) => (
                  <line
                    key={`line-${i}`}
                    x1={PAD_LEFT}
                    y1={PAD_TOP + i * LINE_SPACING}
                    x2={SVG_WIDTH - 20}
                    y2={PAD_TOP + i * LINE_SPACING}
                    stroke="oklch(40% 0.02 250)"
                    strokeWidth={1}
                  />
                ))}

                {/* Treble clef */}
                <text
                  x={PAD_LEFT + 6}
                  y={PAD_TOP + 3.65 * LINE_SPACING}
                  fontSize={64}
                  fontFamily="serif"
                  fill="oklch(55% 0.02 250)"
                >
                  {"\u{1D11E}"}
                </text>

                {/* Clickable area */}
                <rect
                  x={PAD_LEFT + CLEF_WIDTH}
                  y={4}
                  width={CLICK_AREA_WIDTH}
                  height={SVG_HEIGHT - 8}
                  fill="transparent"
                  cursor="pointer"
                  onClick={handleClick}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setHoverSteps(null)}
                />

                {/* Hover ghost */}
                {hoverY !== null && !feedback && (
                  <>
                    {hoverLedgerYs.map((ly, i) => (
                      <line
                        key={`ghost-ledger-${i}`}
                        x1={noteX - 16}
                        y1={ly}
                        x2={noteX + 16}
                        y2={ly}
                        stroke="oklch(40% 0.02 250 / 0.4)"
                        strokeWidth={1}
                        pointerEvents="none"
                      />
                    ))}
                    <ellipse
                      cx={noteX}
                      cy={hoverY}
                      rx={8}
                      ry={6}
                      fill="oklch(75% 0.15 250 / 0.3)"
                      transform={`rotate(-10 ${noteX} ${hoverY})`}
                      pointerEvents="none"
                    />
                  </>
                )}

                {/* Feedback note */}
                {feedbackY !== null && (
                  <>
                    {feedbackLedgerYs.map((ly, i) => (
                      <line
                        key={`fb-ledger-${i}`}
                        x1={noteX - 16}
                        y1={ly}
                        x2={noteX + 16}
                        y2={ly}
                        stroke="oklch(40% 0.02 250)"
                        strokeWidth={1}
                        pointerEvents="none"
                      />
                    ))}
                    <ellipse
                      cx={noteX}
                      cy={feedbackY}
                      rx={8}
                      ry={6}
                      fill={
                        feedback?.correct
                          ? "oklch(65% 0.2 150)"
                          : "oklch(60% 0.2 25)"
                      }
                      transform={`rotate(-10 ${noteX} ${feedbackY})`}
                      pointerEvents="none"
                    />
                    {/* Show correct position on wrong answer */}
                    {!feedback?.correct && (
                      <>
                        {getLedgerLineYs(targetNote.stepsFromBottom).map(
                          (ly, i) => (
                            <line
                              key={`correct-ledger-${i}`}
                              x1={noteX - 16}
                              y1={ly}
                              x2={noteX + 16}
                              y2={ly}
                              stroke="oklch(65% 0.2 150 / 0.6)"
                              strokeWidth={1}
                              pointerEvents="none"
                            />
                          )
                        )}
                        <ellipse
                          cx={noteX}
                          cy={stepsToY(targetNote.stepsFromBottom)}
                          rx={8}
                          ry={6}
                          fill="oklch(65% 0.2 150 / 0.5)"
                          stroke="oklch(65% 0.2 150)"
                          strokeWidth={1.5}
                          transform={`rotate(-10 ${noteX} ${stepsToY(targetNote.stepsFromBottom)})`}
                          pointerEvents="none"
                        />
                      </>
                    )}
                  </>
                )}
              </svg>
            </div>

            {/* Streak indicator */}
            <div className="mb-3 flex justify-center gap-1.5">
              {Array.from({ length: REQUIRED_STREAK }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i < streak ? "bg-green-400" : "bg-surface-600"
                  }`}
                />
              ))}
            </div>

            {/* Hear button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => playTone(targetNote.midi)}
                className="rounded bg-surface-700 px-2 py-1 text-xs text-text-secondary transition-colors hover:bg-surface-600"
              >
                Hear {targetNote.name}
              </button>
            </div>

            <AnimatePresence>
              {explanation && (
                <ExerciseExplanation
                  exerciseTitle="Ledger Line Notes"
                  exerciseType="theory"
                  question={explanation.question}
                  studentAnswer={explanation.studentAnswer}
                  correctAnswer={explanation.correctAnswer}
                  isCorrect={explanation.isCorrect}
                  lessonTitle={lessonTitle}
                  levelTitle={levelTitle}
                  levelOrder={levelOrder}
                  onClose={() => setExplanation(null)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
