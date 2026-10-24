"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import type { Book } from "@/types/book";
import { BookDetailActions } from "./BookDetailActions";

interface Props {
  book: Book;
  formatName?: string;
  fontName?: string;
}

export function BookDetailHeader({ book, formatName, fontName }: Props) {
  return (
    <div className="mb-8 select-none">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-bold text-primary tracking-wider uppercase mb-1">
            Seu livro
          </p>
          <h1 className="font-serif text-3xl lg:text-[34px] font-normal text-foreground tracking-tight">
            {book.title}
          </h1>
          <p className="text-base text-muted font-normal mt-1">{book.author_name || "Autor"}</p>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            {formatName && <Badge tone="neutral">{formatName}</Badge>}
            {fontName && <Badge tone="neutral">{fontName}</Badge>}
          </div>
        </div>

        <BookDetailActions bookId={book.id} />
      </div>
    </div>
  );
}
