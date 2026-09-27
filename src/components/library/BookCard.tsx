import React from "react";
import Link from "next/link";
import type { Book } from "@/types/book";
import { formatLastEdited } from "@/utils/format";
import { BookCoverArtwork } from "./BookCoverArtwork";

interface Props {
  book: Book;
  index: number;
  formatName?: string;
  fontName?: string;
}

export function BookCard({ book, index, formatName, fontName }: Props) {
  const metaText = [formatName || "14 × 21 cm", fontName || "Merriweather"]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/books/${book.id}`}
      className="flex flex-col bg-surface border border-border rounded-xl overflow-hidden shadow-xs hover:border-primary/50 transition-all group cursor-pointer"
    >
      <BookCoverArtwork index={index} />

      <div className="flex flex-col flex-1 p-5 pt-4">
        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {book.title}
        </h3>
        <p className="text-sm text-muted mt-1 truncate">
          {book.author_name || "Autor"}
        </p>
        <p className="text-xs text-muted mt-2 truncate">
          {metaText}
        </p>

        <div className="border-t border-border mt-4 pt-3">
          <p className="text-xs text-muted">
            Atualizado {formatLastEdited(book.updated_at)}
          </p>
        </div>
      </div>
    </Link>
  );
}
