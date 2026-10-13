import type { useChapterEditor } from "./useChapterEditor";
import type { useReview } from "@/hooks/useReview";

export interface EditorWorkspaceProps {
  ed: ReturnType<typeof useChapterEditor>;
  rev: ReturnType<typeof useReview>;
  chapterId: string;
  bookId: string;
  headingNumber: string;
  isReviewOpen: boolean;
  onOpenReview: () => void;
  onCloseReview: () => void;
}

