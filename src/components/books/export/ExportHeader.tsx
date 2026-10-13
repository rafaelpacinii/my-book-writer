import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ExportHeader({ bookId }: { bookId: string }) {
  return (
    <div className="mb-6 select-none">
      <Link
        href={`/books/view?bookId=${encodeURIComponent(bookId)}`}
        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-muted hover:text-foreground transition-colors cursor-pointer mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar</span>
      </Link>
      <h1 className="font-serif text-3xl lg:text-[32px] font-normal text-foreground tracking-tight">
        Exportar livro
      </h1>
      <p className="text-base text-muted font-normal mt-1.5">
        Exporte seu livro em PDF para impressão ou em EPUB para leitores digitais.
      </p>
    </div>
  );
}
