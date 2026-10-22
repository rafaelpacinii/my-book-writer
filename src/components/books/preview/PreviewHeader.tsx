import { BookBreadcrumbs } from "@/components/shared/BookBreadcrumbs";
import type { ReactNode } from "react";

export function PreviewHeader({ bookId, title, children }: { bookId: string; title: string; children: ReactNode }) {
  return (
    <header className="flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-4 border-b border-border bg-surface px-5 py-3 select-none">
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex flex-col min-w-0">
          <BookBreadcrumbs bookId={bookId} bookTitle={title} current="Prévia" />
          <span className="text-xs text-muted truncate">Livro completo · somente leitura</span>
        </div>
      </div>
      {children}
    </header>
  );
}

