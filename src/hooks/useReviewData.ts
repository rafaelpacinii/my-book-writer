"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getReviewProgress, listReviewComments } from "@/lib/api/reviews";
import { reviewError } from "@/utils/reviewState";
import type { ReviewComment, ReviewProgress } from "@/types/review";

interface Data {
  chapterId: string;
  comments: ReviewComment[];
  progress: ReviewProgress | null;
  isLoading: boolean;
  error: string | null;
}

export function useReviewData(chapterId: string, revision: number) {
  const [data, setData] = useState<Data>({ chapterId, comments: [], progress: null, isLoading: true, error: null });
  const scope = useRef(chapterId);
  const request = useRef(0);
  scope.current = chapterId;
  const invalidate = useCallback(() => { request.current++; }, []);

  const reload = useCallback(async () => {
    if (scope.current !== chapterId) return;
    const token = ++request.current;
    setData((old) => ({ chapterId, comments: old.chapterId === chapterId ? old.comments : [],
      progress: old.chapterId === chapterId ? old.progress : null, isLoading: true, error: null }));
    try {
      const [comments, progress] = await Promise.all([listReviewComments(chapterId), getReviewProgress(chapterId)]);
      if (scope.current === chapterId && request.current === token) {
        setData({ chapterId, comments, progress, isLoading: false, error: null });
      }
    } catch (cause) {
      if (scope.current === chapterId && request.current === token) {
        setData({ chapterId, comments: [], progress: null, isLoading: false, error: reviewError(cause) });
      }
    }
  }, [chapterId]);

  useEffect(() => {
    if (chapterId) void reload();
    return invalidate;
  }, [chapterId, revision, reload, invalidate]);

  const current = data.chapterId === chapterId ? data
    : { chapterId, comments: [], progress: null, isLoading: true, error: null };
  return { ...current, reload };
}
