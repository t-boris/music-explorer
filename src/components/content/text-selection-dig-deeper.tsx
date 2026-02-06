"use client";

import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DigDeeperPopover } from "./dig-deeper-popover";

// ─── Props ───

interface TextSelectionDigDeeperProps {
  children: ReactNode;
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
}

// ─── Component ───

export function TextSelectionDigDeeper({
  children,
  lessonTitle,
  levelTitle,
  levelOrder,
}: TextSelectionDigDeeperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState("");
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const [showButton, setShowButton] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const clearSelection = useCallback(() => {
    setShowButton(false);
    setSelectedText("");
    setButtonRect(null);
  }, []);

  const handleSelectionCheck = useCallback(() => {
    // Small delay to let selection finalize
    requestAnimationFrame(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        clearSelection();
        return;
      }

      const text = selection.toString().trim();
      if (text.length < 10) {
        clearSelection();
        return;
      }

      // Check if selection is inside the container
      const range = selection.getRangeAt(0);
      if (!containerRef.current?.contains(range.commonAncestorContainer)) {
        clearSelection();
        return;
      }

      // Check if selection is inside an interactive component (data-no-dig-deeper)
      let node: Node | null = range.startContainer;
      while (node && node !== containerRef.current) {
        if (node instanceof HTMLElement && node.hasAttribute("data-no-dig-deeper")) {
          clearSelection();
          return;
        }
        node = node.parentNode;
      }

      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setButtonRect(rect);
      setShowButton(true);
    });
  }, [clearSelection]);

  // Listen for mouseup and touchend on the container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseUp = () => {
      // Small timeout to let selection finalize
      setTimeout(handleSelectionCheck, 10);
    };

    const handleTouchEnd = () => {
      setTimeout(handleSelectionCheck, 10);
    };

    container.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleSelectionCheck]);

  // Listen for selection changes to detect when selection is cleared
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        // Only clear the button, not the popover
        if (!showPopover) {
          clearSelection();
        }
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [showPopover, clearSelection]);

  const handleButtonClick = useCallback(() => {
    setShowButton(false);
    setShowPopover(true);
  }, []);

  const handlePopoverClose = useCallback(() => {
    setShowPopover(false);
    setSelectedText("");
    setButtonRect(null);
    // Clear the browser's text selection
    window.getSelection()?.removeAllRanges();
  }, []);

  // Calculate button position
  const getButtonStyle = (): React.CSSProperties => {
    if (!buttonRect) return { display: "none" };

    const buttonWidth = 140;
    const left = Math.max(
      8,
      Math.min(
        buttonRect.left + buttonRect.width / 2 - buttonWidth / 2,
        window.innerWidth - buttonWidth - 8
      )
    );

    return {
      position: "fixed",
      top: buttonRect.top - 44,
      left,
      zIndex: 45,
    };
  };

  return (
    <div ref={containerRef}>
      {children}

      <AnimatePresence>
        {showButton && !showPopover && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            style={getButtonStyle()}
          >
            <button
              ref={buttonRef}
              type="button"
              onClick={handleButtonClick}
              className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm font-medium text-text-primary shadow-xl transition-colors hover:bg-surface-700"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent-400" />
              Dig Deeper
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <DigDeeperPopover
        isOpen={showPopover}
        onClose={handlePopoverClose}
        selectedText={selectedText}
        lessonTitle={lessonTitle}
        levelTitle={levelTitle}
        levelOrder={levelOrder}
        anchorRect={buttonRect}
      />
    </div>
  );
}
