import React from "react";
import { BookBreadcrumbs } from "@/components/shared/BookBreadcrumbs";

export function ExportHeader({ bookId, bookTitle }: { bookId: string; bookTitle?: string }) {
  return (
    <div className="mb-6 select-none">
      <div className="mb-4">
        <BookBreadcrumbs bookId={bookId} bookTitle={bookTitle} current="Exportar" />
      </div>
      <h1 className="font-serif text-3xl lg:text-[32px] font-normal text-foreground tracking-tight">
        Exportar livro
      </h1>
      <p className="text-base text-muted font-normal mt-1.5">
        Exporte seu livro em PDF para impressão ou em EPUB para leitores digitais.
      </p>
    </div>
  );
}
