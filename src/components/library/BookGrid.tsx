import React from "react";
import type { Book } from "@/types/book";
import { BookCard } from "./BookCard";

interface Props {
  books: Book[];
  formatMap: Map<string, string>;
  fontMap: Map<string, string>;
}

export function BookGrid({ books, formatMap, fontMap }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book, idx) => (
        <BookCard
          key={book.id}
          book={book}
          index={idx}
          formatName={formatMap.get(book.format_id)}
          fontName={fontMap.get(book.font_preset_id)}
        />
      ))}
    </div>
  );
}
