"use client";

import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { DigDeeperPopover } from "./dig-deeper-popover";

// ─── Context ───

interface DigDeeperContextValue {
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
}

const DigDeeperContext = createContext<DigDeeperContextValue | null>(null);

interface DigDeeperProviderProps {
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
  children: ReactNode;
}

export function DigDeeperProvider({
  lessonTitle,
  levelTitle,
  levelOrder,
  children,
}: DigDeeperProviderProps) {
  return (
    <DigDeeperContext.Provider value={{ lessonTitle, levelTitle, levelOrder }}>
      {children}
    </DigDeeperContext.Provider>
  );
}

export function useDigDeeperContext(): DigDeeperContextValue {
  const ctx = useContext(DigDeeperContext);
  if (!ctx) {
    throw new Error("DigDeeper must be used within a DigDeeperProvider");
  }
  return ctx;
}

// ─── DigDeeper Term Component ───

interface DigDeeperProps {
  children: ReactNode;
  term?: string;
}

export function DigDeeper({ children, term }: DigDeeperProps) {
  const { lessonTitle, levelTitle, levelOrder } = useDigDeeperContext();
  const [isOpen, setIsOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  // Extract text content from children for the term if not explicitly provided
  const resolvedTerm = term || (typeof children === "string" ? children : "");

  const handleClick = useCallback(() => {
    if (spanRef.current) {
      setAnchorRect(spanRef.current.getBoundingClientRect());
    }
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <span
        ref={spanRef}
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className="inline-flex cursor-pointer items-baseline gap-0.5 border-b border-dotted border-accent-400/50 text-inherit transition-colors hover:border-accent-400 hover:text-accent-400"
      >
        {children}
        <Sparkles className="inline h-3 w-3 shrink-0 translate-y-[-1px] text-accent-400/60" />
      </span>

      <DigDeeperPopover
        isOpen={isOpen}
        onClose={handleClose}
        term={resolvedTerm}
        lessonTitle={lessonTitle}
        levelTitle={levelTitle}
        levelOrder={levelOrder}
        anchorRect={anchorRect}
      />
    </>
  );
}
