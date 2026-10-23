"use client";

import { ReviewDrawer } from "@/components/books/editor/review/ReviewDrawer";
import type { ReviewController } from "@/components/books/editor/review/types";

interface Props {
  rev: ReviewController;
  isOpen: boolean;
  onClose: () => void;
}

export function EditorReviewPanel({ rev, isOpen, onClose }: Props) {
  return isOpen ? <ReviewDrawer review={rev} onClose={onClose} /> : null;
}
