"use client";

import { useReviewData } from "@/hooks/useReviewData";
import { reviewState } from "@/utils/reviewState";

export function useChapterReviewStatus(chapterId: string, revision: number) {
  const data = useReviewData(chapterId, revision);
  const openCommentsCount = data.comments.filter((comment) => comment.status === "open").length;
  const state = reviewState(data.progress, revision, openCommentsCount);
  return { needsRecheck: state === "pending" || state === "outdated", openCommentsCount,
    isLoading: data.isLoading, error: data.error, retry: data.reload };
}

