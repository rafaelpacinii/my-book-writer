import type { useChapterEditor } from "./useChapterEditor";
import type { useReview } from "@/hooks/useReview";
import type { useChapterVersions } from "@/hooks/useChapterVersions";

export interface MainProps {
  bookId: string;
  chapterId: string;
}

export interface MainEditorState {
  ed: ReturnType<typeof useChapterEditor>;
  rev: ReturnType<typeof useReview>;
  ver: ReturnType<typeof useChapterVersions>;
  isReviewOpen: boolean;
  setIsReviewOpen: (open: boolean) => void;
  isVersionOpen: boolean;
  setIsVersionOpen: (open: boolean) => void;
  headingNumber: string;
}

