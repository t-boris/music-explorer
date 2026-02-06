"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";

// ─── Types ───

interface WaveLabelerProps {
  onComplete: () => void;
  completed: boolean;
}

type LabelName = "Frequency" | "Amplitude" | "Wavelength";

interface DropZone {
  id: LabelName;
  x: number;
  y: number;
  width: number;
  height: number;
  description: string;
}

// ─── Constants ───

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 200;

const DROP_ZONES: DropZone[] = [
  {
    id: "Amplitude",
    x: 60,
    y: 30,
    width: 100,
    height: 40,
    description: "Wave height",
  },
  {
    id: "Wavelength",
    x: 160,
    y: 150,
    width: 110,
    height: 40,
    description: "Horizontal cycle length",
  },
  {
    id: "Frequency",
    x: 340,
    y: 150,
    width: 110,
    height: 40,
    description: "Cycles per second",
  },
];

// ─── Helpers ───

function drawWave(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = "oklch(20% 0.01 250)";
  ctx.fillRect(0, 0, w, h);

  // Grid center line
  ctx.strokeStyle = "oklch(25% 0.015 250)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();

  // Sine wave
  ctx.beginPath();
  ctx.strokeStyle = "oklch(75% 0.15 65)";
  ctx.lineWidth = 2.5;

  const cycles = 3;
  const mid = h / 2;
  const amp = h / 2 - 20;

  for (let x = 0; x < w; x++) {
    const t = (x / w) * cycles * 2 * Math.PI;
    const y = mid - Math.sin(t) * amp;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Amplitude indicator (vertical double arrow)
  const arrowX = 42;
  ctx.strokeStyle = "oklch(55% 0.12 200)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(arrowX, mid);
  ctx.lineTo(arrowX, mid - amp);
  ctx.stroke();
  ctx.setLineDash([]);

  // Arrow heads
  ctx.fillStyle = "oklch(55% 0.12 200)";
  ctx.beginPath();
  ctx.moveTo(arrowX - 4, mid - amp + 8);
  ctx.lineTo(arrowX, mid - amp);
  ctx.lineTo(arrowX + 4, mid - amp + 8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(arrowX - 4, mid - 8);
  ctx.lineTo(arrowX, mid);
  ctx.lineTo(arrowX + 4, mid - 8);
  ctx.fill();

  // Wavelength indicator (horizontal double arrow below wave)
  const cycleStart = 0;
  const cycleEnd = w / cycles;
  const arrowY = h - 16;
  ctx.strokeStyle = "oklch(55% 0.12 130)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(cycleStart + 8, arrowY);
  ctx.lineTo(cycleEnd - 8, arrowY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Arrow heads
  ctx.fillStyle = "oklch(55% 0.12 130)";
  ctx.beginPath();
  ctx.moveTo(cycleStart + 16, arrowY - 4);
  ctx.lineTo(cycleStart + 8, arrowY);
  ctx.lineTo(cycleStart + 16, arrowY + 4);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cycleEnd - 16, arrowY - 4);
  ctx.lineTo(cycleEnd - 8, arrowY);
  ctx.lineTo(cycleEnd - 16, arrowY + 4);
  ctx.fill();

  // Frequency indicator (text near top-right)
  ctx.fillStyle = "oklch(55% 0.12 320)";
  ctx.font = "11px monospace";
  ctx.textAlign = "center";
  ctx.fillText("f = cycles/sec", 385, 18);
}

// ─── Component ───

export function WaveLabeler({ onComplete, completed }: WaveLabelerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [placed, setPlaced] = useState<Record<string, LabelName | null>>({
    Amplitude: null,
    Wavelength: null,
    Frequency: null,
  });
  const [draggingLabel, setDraggingLabel] = useState<LabelName | null>(null);
  const [done, setDone] = useState(completed);
  const completedRef = useRef(false);

  useEffect(() => {
    if (canvasRef.current) {
      drawWave(canvasRef.current);
    }
  }, []);

  const availableLabels: LabelName[] = (
    ["Frequency", "Amplitude", "Wavelength"] as LabelName[]
  ).filter((label) => {
    return !Object.values(placed).includes(label);
  });

  const handleDragStart = useCallback(
    (e: React.DragEvent, label: LabelName) => {
      setDraggingLabel(label);
      e.dataTransfer.setData("text/plain", label);
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, zoneId: LabelName) => {
      e.preventDefault();
      const label = e.dataTransfer.getData("text/plain") as LabelName;
      setDraggingLabel(null);

      if (label !== zoneId) {
        // Wrong placement -- brief shake feedback, don't place
        return;
      }

      const newPlaced = { ...placed, [zoneId]: label };
      setPlaced(newPlaced);

      // Check if all are correctly placed
      const allCorrect = DROP_ZONES.every((z) => newPlaced[z.id] === z.id);
      if (allCorrect && !completedRef.current) {
        completedRef.current = true;
        setDone(true);
        onComplete();
      }
    },
    [placed, onComplete]
  );

  // Touch-based fallback for mobile
  const handleTapZone = useCallback(
    (zoneId: LabelName) => {
      if (!draggingLabel) return;
      if (draggingLabel !== zoneId) {
        setDraggingLabel(null);
        return;
      }

      const newPlaced = { ...placed, [zoneId]: draggingLabel };
      setPlaced(newPlaced);
      setDraggingLabel(null);

      const allCorrect = DROP_ZONES.every((z) => newPlaced[z.id] === z.id);
      if (allCorrect && !completedRef.current) {
        completedRef.current = true;
        setDone(true);
        onComplete();
      }
    },
    [draggingLabel, placed, onComplete]
  );

  const handleTapLabel = useCallback((label: LabelName) => {
    setDraggingLabel((prev) => (prev === label ? null : label));
  }, []);

  return (
    <div className="rounded-xl border border-surface-700 bg-surface-800 p-4">
      <h3 className="mb-3 text-sm font-semibold text-text-primary">
        Label the Wave Properties
      </h3>

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
              All labels placed correctly!
            </p>
          </motion.div>
        ) : (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Wave canvas with drop zones */}
            <div className="relative mb-4 overflow-hidden rounded-lg">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="w-full"
                style={{ maxWidth: CANVAS_WIDTH }}
              />
              {/* Drop zones overlaid on canvas */}
              {DROP_ZONES.map((zone) => (
                <div
                  key={zone.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, zone.id)}
                  onClick={() => handleTapZone(zone.id)}
                  className={`absolute flex items-center justify-center rounded border-2 border-dashed text-xs transition-colors ${
                    placed[zone.id]
                      ? "border-green-500/50 bg-green-500/10 text-green-400"
                      : draggingLabel
                        ? "border-accent-400/50 bg-accent-400/10 text-text-muted"
                        : "border-surface-500/50 text-text-muted"
                  }`}
                  style={{
                    left: `${(zone.x / CANVAS_WIDTH) * 100}%`,
                    top: `${(zone.y / CANVAS_HEIGHT) * 100}%`,
                    width: `${(zone.width / CANVAS_WIDTH) * 100}%`,
                    height: `${(zone.height / CANVAS_HEIGHT) * 100}%`,
                  }}
                >
                  {placed[zone.id] ? (
                    <span className="font-medium">{placed[zone.id]}</span>
                  ) : (
                    <span className="opacity-60">{zone.description}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Draggable labels */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-text-muted">
                {draggingLabel ? "Tap a drop zone:" : "Drag (or tap) a label:"}
              </span>
              {availableLabels.map((label) => (
                <div
                  key={label}
                  draggable
                  onDragStart={(e) => handleDragStart(e, label)}
                  onClick={() => handleTapLabel(label)}
                  className={`cursor-grab rounded-full px-3 py-1 text-xs font-medium transition-colors active:cursor-grabbing ${
                    draggingLabel === label
                      ? "bg-accent-400 text-surface-900"
                      : "bg-accent-500/20 text-accent-400 hover:bg-accent-500/30"
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
