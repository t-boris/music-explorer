"use client";

import type { ReactNode } from "react";
import { DigDeeperProvider } from "./dig-deeper-term";
import { TextSelectionDigDeeper } from "./text-selection-dig-deeper";

interface LessonContentWrapperProps {
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
  children: ReactNode;
}

/**
 * Client wrapper that combines the DigDeeper context provider (for inline
 * <DigDeeper> MDX tags) with the text selection detector (for freeform
 * selection-based explanations). Wraps the server-rendered MDX article.
 */
export function LessonContentWrapper({
  lessonTitle,
  levelTitle,
  levelOrder,
  children,
}: LessonContentWrapperProps) {
  return (
    <DigDeeperProvider lessonTitle={lessonTitle} levelTitle={levelTitle} levelOrder={levelOrder}>
      <TextSelectionDigDeeper lessonTitle={lessonTitle} levelTitle={levelTitle} levelOrder={levelOrder}>
        {children}
      </TextSelectionDigDeeper>
    </DigDeeperProvider>
  );
}
