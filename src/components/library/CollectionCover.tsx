import { BookObject } from "@/components/shared/BookObject";
import type { Book } from "@/types/book";

export function CollectionCover({ books, kind }: { books: Book[]; kind: "series" | "universe" }) {
  return (
    <div className="book-stage collection-stage">
      <div className="collection-stack" data-kind={kind} data-cover-count={Math.min(books.length, 3)}>
        {[0, 1, 2].map((index) => (
          <div key={index} className="collection-cover" data-slot={index} data-empty={!books[index]}>
            {books[index] ? <BookObject book={books[index]} /> : (
              <span className="collection-empty-cover" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
