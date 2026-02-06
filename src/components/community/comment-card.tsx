"use client";

import type { Comment } from "@/types/index";
import type { Timestamp } from "firebase/firestore";

interface CommentCardProps {
  comment: Comment;
  canDelete: boolean;
  onDelete?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function relativeTime(timestamp: Timestamp): string {
  const now = Date.now();
  const then = timestamp.toMillis();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(then).toLocaleDateString();
}

export function CommentCard({ comment, canDelete, onDelete }: CommentCardProps) {
  return (
    <div className="flex gap-3 py-2">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-700 flex items-center justify-center text-xs font-medium text-secondary">
        {getInitials(comment.authorDisplayName)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary truncate">
            {comment.authorDisplayName}
          </span>
          <span className="text-xs text-secondary flex-shrink-0">
            {comment.createdAt ? relativeTime(comment.createdAt) : ""}
          </span>
          {canDelete && onDelete && (
            <button
              onClick={onDelete}
              className="ml-auto flex-shrink-0 p-1 text-secondary hover:text-red-400 transition-colors"
              aria-label="Delete comment"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
        <p className="text-sm text-primary mt-0.5 break-words">
          {comment.text}
        </p>
      </div>
    </div>
  );
}
