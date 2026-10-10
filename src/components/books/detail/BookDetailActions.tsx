"use client";

import React from "react";
import Link from "next/link";
import { Settings, BookOpen, FileDown, BookMarked } from "lucide-react";

interface Props {
  bookId: string;
  onOpenFrontMatter: () => void;
}

export function BookDetailActions({ bookId, onOpenFrontMatter }: Props) {
  const btn = "inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-surface text-foreground font-bold text-xs hover:border-primary/40 transition-colors shadow-xs cursor-pointer";

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <button type="button" onClick={onOpenFrontMatter} className={btn} title="Personalizar páginas pré-textuais">
        <BookMarked className="w-4 h-4 text-muted" />
        <span>Páginas Iniciais</span>
      </button>
      <Link href={`/books/settings?bookId=${encodeURIComponent(bookId)}`} className={btn}>
        <Settings className="w-4 h-4 text-muted" />
        <span>Configurações</span>
      </Link>
      <Link href={`/books/preview?bookId=${encodeURIComponent(bookId)}`} className={btn}>
        <BookOpen className="w-4 h-4 text-muted" />
        <span>Ver livro completo</span>
      </Link>
      <Link href={`/books/export?bookId=${encodeURIComponent(bookId)}`} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-opacity shadow-xs">
        <FileDown className="w-4 h-4" />
        <span>Exportar</span>
      </Link>
    </div>
  );
}

