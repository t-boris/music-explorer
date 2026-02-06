"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useComments } from "@/hooks/use-comments";
import { CommentCard } from "@/components/community/comment-card";
import type { Comment } from "@/types/index";

interface CommentSectionProps {
  targetUserId: string;
  targetType: Comment["targetType"];
  targetId: string;
}

export function CommentSection({
  targetUserId,
  targetType,
  targetId,
}: CommentSectionProps) {
  const { user } = useAuth();
  const { comments, loading, submitting, addComment, deleteComment } =
    useComments(targetUserId, targetType, targetId);
  const [text, setText] = useState("");

  const isOwnItem = user?.uid === targetUserId;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    await addComment(text);
    setText("");
  }

  if (loading) {
    return (
      <div className="py-3 text-sm text-secondary animate-pulse">
        Loading comments...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Comment list */}
      {comments.length === 0 ? (
        <p className="py-3 text-sm text-secondary">
          No comments yet. Be the first to leave feedback!
        </p>
      ) : (
        <div className="divide-y divide-surface-700">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              canDelete={comment.authorId === user?.uid}
              onDelete={() => deleteComment(comment.id)}
            />
          ))}
        </div>
      )}

      {/* Comment input — only show if viewing someone else's item */}
      {user && !isOwnItem && (
        <form onSubmit={handleSubmit} className="flex gap-2 pt-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Leave feedback..."
            rows={2}
            className="flex-1 rounded-md bg-surface-700 border border-surface-600 px-3 py-2 text-sm text-primary placeholder:text-secondary resize-none focus:outline-none focus:ring-1 focus:ring-accent-500"
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="self-end rounded-md bg-accent-500 px-3 py-2 text-sm font-medium text-white hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "..." : "Send"}
          </button>
        </form>
      )}
    </div>
  );
}
