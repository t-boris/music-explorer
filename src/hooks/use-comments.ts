"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  addComment as addCommentService,
  getCommentsForItem,
  deleteComment as deleteCommentService,
} from "@/lib/comment-service";
import type { Comment } from "@/types/index";
import { Timestamp } from "firebase/firestore";

interface UseCommentsResult {
  comments: Comment[];
  loading: boolean;
  submitting: boolean;
  addComment: (text: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
}

export function useComments(
  targetUserId: string,
  targetType: Comment["targetType"],
  targetId: string
): UseCommentsResult {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!targetUserId || !targetType || !targetId) {
      setComments([]);
      setLoading(false);
      return;
    }

    async function fetchComments() {
      try {
        const data = await getCommentsForItem(
          targetUserId,
          targetType,
          targetId
        );
        setComments(data);
      } catch (err) {
        console.error("Failed to load comments:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchComments();
  }, [targetUserId, targetType, targetId]);

  const addComment = useCallback(
    async (text: string) => {
      if (!user || !text.trim()) return;

      setSubmitting(true);

      // Optimistic local comment
      const optimistic: Comment = {
        id: `temp-${Date.now()}`,
        authorId: user.uid,
        authorDisplayName: user.displayName ?? "Anonymous",
        authorPhotoURL: user.photoURL,
        targetUserId,
        targetType,
        targetId,
        text: text.trim(),
        createdAt: Timestamp.now(),
      };
      setComments((prev) => [...prev, optimistic]);

      try {
        const newId = await addCommentService({
          authorId: user.uid,
          authorDisplayName: user.displayName ?? "Anonymous",
          authorPhotoURL: user.photoURL,
          targetUserId,
          targetType,
          targetId,
          text: text.trim(),
        });

        // Replace optimistic comment with real one
        setComments((prev) =>
          prev.map((c) => (c.id === optimistic.id ? { ...c, id: newId } : c))
        );
      } catch (err) {
        console.error("Failed to add comment:", err);
        // Roll back optimistic comment
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      } finally {
        setSubmitting(false);
      }
    },
    [user, targetUserId, targetType, targetId]
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      if (!user) return;

      // Optimistic removal
      const removed = comments.find((c) => c.id === commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));

      try {
        await deleteCommentService(commentId, user.uid);
      } catch (err) {
        console.error("Failed to delete comment:", err);
        // Roll back optimistic removal
        if (removed) {
          setComments((prev) => [...prev, removed]);
        }
      }
    },
    [user, comments]
  );

  return { comments, loading, submitting, addComment, deleteComment };
}
