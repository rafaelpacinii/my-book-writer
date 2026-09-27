"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { Book } from "@/types/book";
import { formatLastEdited } from "@/utils/format";
import { loadBookCoverUrl } from "@/lib/api/images";
import { BookCoverArtwork } from "./BookCoverArtwork";

interface Props {
  book: Book;
  index: number;
  formatName?: string;
  fontName?: string;
}

export function BookCard({ book, index, formatName, fontName }: Props) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void loadBookCoverUrl(book.id, book.card_image_asset_id).then((url) => {
      if (active) setCoverUrl(url);
    });
    return () => {
      active = false;
    };
  }, [book.id, book.card_image_asset_id]);

  const metaText = [formatName || "14 × 21 cm", fontName || "Merriweather"]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/books/view?bookId=${encodeURIComponent(book.id)}`}
      className="flex flex-col bg-surface border border-border rounded-xl overflow-hidden shadow-xs hover:border-primary/50 transition-all group cursor-pointer"
    >
      {coverUrl ? (
        <div className="relative aspect-[3/2] w-full overflow-hidden bg-surface-hover">
          <img
            src={coverUrl}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <BookCoverArtwork index={index} />
      )}

      <div className="flex flex-col flex-1 p-5 pt-4">
        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {book.title}
        </h3>
        <p className="text-sm text-muted mt-1 truncate">
          {book.author_name || "Autor"}
        </p>
        <p className="text-xs text-muted mt-2 truncate">{metaText}</p>

        <div className="border-t border-border mt-4 pt-3">
          <p className="text-xs text-muted">
            Atualizado {formatLastEdited(book.updated_at)}
          </p>
        </div>
      </div>
    </Link>
  );
}
