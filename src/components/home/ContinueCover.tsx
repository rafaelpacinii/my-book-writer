import type { Book } from "@/types/book";
import { BookObject } from "@/components/shared/BookObject";

export function ContinueCover({ book }: { book: Book }) {
  return (
    <div className="resume-visual">
      <BookObject book={book} />
    </div>
  );
}
