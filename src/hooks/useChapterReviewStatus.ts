"use client";

import { useEffect, useState } from "react";
import { getReviewProgress, listReviewComments } from "@/lib/api/reviews";

export function useChapterReviewStatus(chapterId: string) {
  const [needsRecheck, setNeedsRecheck] = useState(false);
  const [openCommentsCount, setOpenCommentsCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    void Promise.all([
      getReviewProgress(chapterId),
      listReviewComments(chapterId),
    ])
      .then(([prog, comments]) => {
        if (!isMounted) return;
        setNeedsRecheck(Boolean(prog?.needs_recheck));
        setOpenCommentsCount(comments.filter((c) => c.status === "open").length);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [chapterId]);

  return { needsRecheck, openCommentsCount };
}

