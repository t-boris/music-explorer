"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, MessageCircle } from "lucide-react";
import { CommentSection } from "@/components/community/comment-section";

interface CommentAccordionProps {
  targetUserId: string;
  targetType: "recording" | "test_attempt" | "exercise_completion" | "practice_session";
  targetId: string;
}

export function CommentAccordion({
  targetUserId,
  targetType,
  targetId,
}: CommentAccordionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2 border-t border-surface-700 pt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        <MessageCircle className="h-3.5 w-3.5" />
        Comments
      </button>
      {open && (
        <div className="mt-2">
          <CommentSection
            targetUserId={targetUserId}
            targetType={targetType}
            targetId={targetId}
          />
        </div>
      )}
    </div>
  );
}
