import type { Book } from "@/types/book";
import { BookObject } from "@/components/shared/BookObject";

export function BookCardCover({ book, index }: { book: Book; index: number }) {
  return (
    <div className="book-stage">
      <span className="book-index absolute top-3 left-3.5 font-mono text-[9px] text-muted" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <BookObject book={book} />
    </div>
  );
}
