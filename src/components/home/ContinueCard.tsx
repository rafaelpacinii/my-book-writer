"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { Book } from "@/types/book";
import { formatLastEdited } from "@/utils/format";
import { loadBookCoverUrl } from "@/lib/api/images";
import { ContinueArtwork } from "./ContinueArtwork";

interface ContinueCardProps {
  book: Book;
}

export function ContinueCard({ book }: ContinueCardProps) {
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

  const lastEdited = formatLastEdited(book.updated_at);
  const author = book.author_name || "Autor";

  return (
    <div className="flex flex-col md:flex-row w-full rounded-2xl border border-border bg-surface overflow-hidden shadow-xs hover:border-primary/40 transition-colors">
      {coverUrl ? (
        <div className="relative w-full md:w-72 lg:w-84 h-52 md:h-auto shrink-0 overflow-hidden bg-surface-hover">
          <img
            src={coverUrl}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <ContinueArtwork />
      )}
      <div className="flex flex-col justify-center p-6 lg:p-8 flex-1 min-w-0">
        <p className="text-xs font-bold tracking-wider text-primary uppercase">
          Continuar escrevendo
        </p>
        <h2 className="font-serif text-2xl lg:text-[27px] font-normal text-foreground leading-snug line-clamp-2 mt-2.5">
          {book.title}
        </h2>
        <p className="text-sm text-muted mt-2 truncate">
          {author} · Última alteração {lastEdited}
        </p>
        <div className="mt-6">
          <Link
            href={`/books/view?bookId=${encodeURIComponent(book.id)}`}
            className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-primary text-primary-foreground font-bold text-[13px] hover:opacity-90 transition-opacity shadow-xs"
          >
            Abrir meu livro
          </Link>
        </div>
      </div>
    </div>
  );
}
