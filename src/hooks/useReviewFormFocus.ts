"use client";

import { useEffect, useRef } from "react";
import type { ReviewAnchor } from "@/types/review";

export function useReviewFormFocus(anchor: ReviewAnchor | null) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (anchor) ref.current?.focus(); }, [anchor]);
  return ref;
}
