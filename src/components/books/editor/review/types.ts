import type { useReview } from "@/hooks/useReview";
import type { ReviewComment } from "@/types/review";

export type ReviewController = ReturnType<typeof useReview>;
export interface ReviewCommentCardProps {
  comment: ReviewComment;
  review: ReviewController;
  onShowText: () => void;
}
