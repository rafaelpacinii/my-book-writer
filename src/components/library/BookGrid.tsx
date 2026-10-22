import type { Book } from "@/types/book";
import { BookCard } from "@/components/library/BookCard";

interface Props {
  books: Book[];
  formatMap: Map<string, string>;
  fontMap: Map<string, string>;
  view: "grid" | "list";
}

export function BookGrid({ books, formatMap, fontMap, view }: Props) {
  return (
    <div className={view === "grid" ? "book-grid" : "book-list"}>
      {books.map((book, index) => (
        <BookCard key={book.id} book={book} index={index}
          formatName={formatMap.get(book.format_id)} fontName={fontMap.get(book.font_preset_id)}
        />
      ))}
    </div>
  );
}
