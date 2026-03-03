"use client";

import type { ReactNode } from "react";
import { DigDeeperProvider } from "./dig-deeper-term";
import { TextSelectionDigDeeper } from "./text-selection-dig-deeper";
import { NotesProvider } from "@/components/notes/notes-provider";

interface LessonContentWrapperProps {
  lessonTitle: string;
  levelTitle: string;
  levelOrder: number;
  levelId: string;
  lessonId: string;
  children: ReactNode;
}

/**
 * Client wrapper that combines the DigDeeper context provider (for inline
 * <DigDeeper> MDX tags), the text selection detector (for freeform
 * selection-based explanations), and the NotesProvider (for lesson notes
 * + sidebar coordination). Wraps the server-rendered MDX article.
 */
export function LessonContentWrapper({
  lessonTitle,
  levelTitle,
  levelOrder,
  levelId,
  lessonId,
  children,
}: LessonContentWrapperProps) {
  return (
    <NotesProvider
      levelId={levelId}
      lessonId={lessonId}
      lessonTitle={lessonTitle}
      levelTitle={levelTitle}
      levelOrder={levelOrder}
    >
      <DigDeeperProvider lessonTitle={lessonTitle} levelTitle={levelTitle} levelOrder={levelOrder}>
        <TextSelectionDigDeeper lessonTitle={lessonTitle} levelTitle={levelTitle} levelOrder={levelOrder}>
          {children}
        </TextSelectionDigDeeper>
      </DigDeeperProvider>
    </NotesProvider>
  );
}
