import { Clock3 } from "lucide-react";
import { LoadingRegion } from "@/components/ui/LoadingRegion";
import { Skeleton } from "@/components/ui/Skeleton";
import { LibraryRecentBookCard } from "@/components/library/LibraryRecentBookCard";
import type { useLibrary } from "@/hooks/useLibrary";
import { libraryRecentBooks } from "@/utils/libraryRecentBooks";
import styles from "@/components/library/libraryRecentBooks.module.css";

export function LibraryRecentBooks({ lib }: { lib: ReturnType<typeof useLibrary> }) {
  const books = libraryRecentBooks(lib.books, lib.scope);
  if (lib.scope.kind === "missing" || (lib.error && !lib.books.length)) return null;
  return (
    <section aria-label="Atualizados recentemente" className={styles.recent}>
      <header className={styles.header}>
        <span className="flex items-center gap-2 text-xs text-muted"><Clock3 size={14} aria-hidden="true" />Atualizados recentemente</span>
        <h2 className="mt-1 font-display text-2xl text-foreground">Retome suas histórias</h2>
      </header>
      <LoadingRegion isLoading={lib.isLoading && !lib.books.length} label="Carregando livros recentes"
        skeleton={<div className="flex flex-col gap-3"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>}>
        {books.length ? <ul className={styles.list}>
          {books.map((book) => <LibraryRecentBookCard key={book.id} book={book} />)}
        </ul> : <p className="text-xs leading-relaxed text-muted">Os livros deste acervo aparecerão aqui conforme você escrever.</p>}
      </LoadingRegion>
    </section>
  );
}
