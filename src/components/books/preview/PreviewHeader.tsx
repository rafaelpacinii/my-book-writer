import { BookBreadcrumbs } from "@/components/shared/BookBreadcrumbs";

export function PreviewHeader({ bookId, title }: { bookId: string; title: string }) {
  return (
    <header className="flex min-h-[72px] shrink-0 items-center border-b border-border bg-surface px-4 py-3 select-none">
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex flex-col min-w-0">
          <BookBreadcrumbs bookId={bookId} bookTitle={title} current="Prévia" />
          <span className="text-xs text-muted truncate">Livro completo · somente leitura</span>
        </div>
      </div>
    </header>
  );
}

