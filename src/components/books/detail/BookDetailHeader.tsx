"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Settings, BookOpen, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Book } from "@/types/book";

interface Props {
  book: Book;
  formatName?: string;
  fontName?: string;
}

export function BookDetailHeader({ book, formatName, fontName }: Props) {
  return (
    <div className="flex flex-col gap-4 mb-8 select-none">
      <Link
        href="/library"
        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-muted hover:text-foreground transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Biblioteca</span>
      </Link>

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

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href={`/books/${book.id}/settings`}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-surface text-foreground font-bold text-xs hover:border-primary/40 transition-colors shadow-xs"
          >
            <Settings className="w-4 h-4 text-muted" />
            <span>Configurações</span>
          </Link>
          <Link
            href={`/books/${book.id}/preview`}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-surface text-foreground font-bold text-xs hover:border-primary/40 transition-colors shadow-xs"
          >
            <BookOpen className="w-4 h-4 text-muted" />
            <span>Ver livro completo</span>
          </Link>
          <Link
            href={`/books/${book.id}/export`}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-opacity shadow-xs"
          >
            <FileDown className="w-4 h-4" />
            <span>Exportar</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
