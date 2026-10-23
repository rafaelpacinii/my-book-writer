"use client";

import React from "react";
import { ChapterReviewBadges } from "@/components/books/detail/ChapterReviewBadges";
import type { useChapterReviewStatus } from "@/hooks/useChapterReviewStatus";
import { formatLastEdited } from "@/utils/format";

interface Props {
  updatedAt: string;
  review: ReturnType<typeof useChapterReviewStatus>;
}

export function ChapterCardFooter({
  updatedAt,
  review,
}: Props) {
  return (
    <div className="border-t border-border pt-3 mt-4 flex items-center justify-between gap-2">
      <p className="text-xs text-muted truncate">
        Última edição {formatLastEdited(updatedAt)}
      </p>

      <ChapterReviewBadges review={review} />
    </div>
  );
}

