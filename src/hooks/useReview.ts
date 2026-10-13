"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createReviewComment,
  deleteReviewComment,
  getReviewProgress,
  listReviewComments,
  markReviewProgress,
  reopenReviewComment,
  resolveReviewComment,
  updateReviewComment,
} from "@/lib/api/reviews";
import { getProfile } from "@/lib/api/profile";
import type { ReviewComment, ReviewProgress } from "@/types/review";

export type ReviewFilter = "all" | "open" | "resolved";

export function useReview(chapterId: string, contentRevision: number = 1) {
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [progress, setProgress] = useState<ReviewProgress | null>(null);
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!chapterId) return;
    try {
      setIsLoading(true);
      const [loadedComments, loadedProgress] = await Promise.all([
        listReviewComments(chapterId),
        getReviewProgress(chapterId),
      ]);
      setComments(loadedComments);
      setProgress(loadedProgress);
    } catch (err) {
      console.error("Erro ao carregar dados de revisão:", err);
    } finally {
      setIsLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openCommentsCount = useMemo(
    () => comments.filter((c) => c.status === "open").length,
    [comments],
  );

  const resolvedCommentsCount = useMemo(
    () => comments.filter((c) => c.status === "resolved").length,
    [comments],
  );

  const filteredComments = useMemo(() => {
    if (filter === "open") return comments.filter((c) => c.status === "open");
    if (filter === "resolved")
      return comments.filter((c) => c.status === "resolved");
    return comments;
  }, [comments, filter]);

  const needsRecheck = Boolean(progress?.needs_recheck);

  const addComment = useCallback(
    async (body: string, excerpt?: string) => {
      const cleanBody = body.trim();
      if (!cleanBody || !chapterId) return null;

      const finalExcerpt = excerpt?.trim() || "Capítulo";
      try {
        setIsSubmitting(true);
        const profile = await getProfile();
        const created = await createReviewComment({
          chapter_id: chapterId,
          author_profile_id: profile.id,
          body: cleanBody,
          original_excerpt: finalExcerpt,
          anchor_revision: contentRevision,
          anchor_json: JSON.stringify({ created_at: new Date().toISOString() }),
        });
        setComments((prev) => [...prev, created]);
        return created;
      } catch (err) {
        console.error("Erro ao criar comentário:", err);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [chapterId, contentRevision],
  );

  const resolveComment = useCallback(async (id: string) => {
    try {
      const updated = await resolveReviewComment(id);
      setComments((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      console.error("Erro ao resolver comentário:", err);
      throw err;
    }
  }, []);

  const reopenComment = useCallback(async (id: string) => {
    try {
      const updated = await reopenReviewComment(id);
      setComments((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      console.error("Erro ao reabrir comentário:", err);
      throw err;
    }
  }, []);

  const editComment = useCallback(async (id: string, body: string) => {
    try {
      const updated = await updateReviewComment(id, body);
      setComments((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      console.error("Erro ao editar comentário:", err);
      throw err;
    }
  }, []);

  const deleteComment = useCallback(async (id: string) => {
    try {
      await deleteReviewComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Erro ao excluir comentário:", err);
      throw err;
    }
  }, []);

  const toggleNeedsRecheck = useCallback(async () => {
    if (!chapterId) return;
    try {
      const profile = await getProfile();
      const nextRecheck = !needsRecheck;
      const updatedProgress = await markReviewProgress({
        chapter_id: chapterId,
        profile_id: profile.id,
        anchor_revision: 1,
        reviewed_content_revision: contentRevision,
        needs_recheck: nextRecheck,
        anchor_json: JSON.stringify({ completed: !nextRecheck }),
      });
      setProgress(updatedProgress);
    } catch (err) {
      console.error("Erro ao alternar status de revisão:", err);
      throw err;
    }
  }, [chapterId, contentRevision, needsRecheck]);

  return {
    comments,
    filteredComments,
    progress,
    needsRecheck,
    filter,
    setFilter,
    openCommentsCount,
    resolvedCommentsCount,
    isLoading,
    isSubmitting,
    addComment,
    editComment,
    deleteComment,
    resolveComment,
    reopenComment,
    toggleNeedsRecheck,
    reload: loadData,
  };
}

