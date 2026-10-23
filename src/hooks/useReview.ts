"use client";

import { useState } from "react";
import { useReviewData } from "@/hooks/useReviewData";
import { useReviewDraft } from "@/hooks/useReviewDraft";
import { useReviewActions } from "@/hooks/useReviewActions";
import { reviewState } from "@/utils/reviewState";
import type { ReviewComment } from "@/types/review";

export type ReviewFilter = "all" | "open" | "resolved";

export function useReview(chapterId: string, contentRevision = 0, saveNow?: () => Promise<boolean>, dirty = false, isReady = true) {
  const data = useReviewData(chapterId, contentRevision);
  const drafts = useReviewDraft(chapterId);
  const actions = useReviewActions({ chapterId, ...drafts, reload: data.reload, saveNow, isReady });
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [deletion, setDeletion] = useState<{ chapterId: string; comment: ReviewComment } | null>(null);
  const deleteTarget = deletion?.chapterId === chapterId ? deletion.comment : null;
  const cancelDelete = () => { if (!actions.isPending) setDeletion(null); };
  const confirmDelete = async () => {
    if (deleteTarget && await actions.deleteComment(deleteTarget.id)) setDeletion(null);
  };
  const openCommentsCount = data.comments.filter((c) => c.status === "open").length;
  const resolvedCommentsCount = data.comments.length - openCommentsCount;
  const state = reviewState(data.progress, contentRevision, openCommentsCount, dirty);
  return { ...data, ...drafts, ...actions, filter, setFilter, state, openCommentsCount, resolvedCommentsCount,
    isLoading: data.isLoading || !isReady,
    deleteTarget, cancelDelete, confirmDelete, requestDelete: (comment: ReviewComment) => setDeletion({ chapterId, comment }),
    needsRecheck: state === "pending" || state === "outdated",
    filteredComments: data.comments.filter((c) => filter === "all" || c.status === filter) };
}

