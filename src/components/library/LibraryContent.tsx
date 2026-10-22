import { LibraryFilters } from "@/components/library/LibraryFilters";
import { LibraryResultsBar } from "@/components/library/LibraryResultsBar";
import { BookGrid } from "@/components/library/BookGrid";
import { LibraryEmpty } from "@/components/library/LibraryEmpty";
import { LibraryNoResults } from "@/components/library/LibraryNoResults";
import type { useLibrary } from "@/hooks/useLibrary";

export function LibraryContent({ lib }: { lib: ReturnType<typeof useLibrary> }) {
  if (!lib.books.length) return <LibraryEmpty />;
  return (
    <section aria-label="Seu acervo">
      <LibraryResultsBar isFiltered={lib.isFiltered} totalResults={lib.filteredBooks.length}
        totalBooks={lib.books.length} onClearFilters={lib.handleClearFilters}
      />
      <LibraryFilters lib={lib} />
      {lib.filteredBooks.length ? (
        <BookGrid books={lib.filteredBooks} formatMap={lib.formatMap} fontMap={lib.fontMap} view={lib.view} />
      ) : <LibraryNoResults onClearFilters={lib.handleClearFilters} />}
    </section>
  );
}
