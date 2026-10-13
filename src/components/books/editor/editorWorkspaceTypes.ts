import type { useChapterEditor } from "./useChapterEditor";
import type { useReview } from "@/hooks/useReview";
import type { useChapterVersions } from "@/hooks/useChapterVersions";

export interface EditorWorkspaceProps {
  ed: ReturnType<typeof useChapterEditor>;
  rev: ReturnType<typeof useReview>;
  ver: ReturnType<typeof useChapterVersions>;
  chapterId: string;
  bookId: string;
  headingNumber: string;
  isReviewOpen: boolean;
  onOpenReview: () => void;
  onCloseReview: () => void;
  isVersionOpen: boolean;
  onCloseVersion: () => void;
}

