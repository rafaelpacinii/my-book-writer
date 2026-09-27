"use client";

import React from "react";
import { AppShell } from "@/components/shared/AppShell";
import { LibraryHeader } from "./LibraryHeader";
import { LibraryFilters } from "./LibraryFilters";
import { LibraryResultsBar } from "./LibraryResultsBar";
import { BookGrid } from "./BookGrid";
import { LibraryEmpty } from "./LibraryEmpty";
import { LibraryNoResults } from "./LibraryNoResults";
import { LibrarySkeleton } from "./LibrarySkeleton";
import { useLibrary } from "./useLibrary";

export function Main() {
  const lib = useLibrary();
  const hasBooks = lib.books.length > 0;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto pb-16">
        <LibraryHeader
          booksCount={lib.books.length}
          isFiltered={lib.isFiltered}
        />

        {hasBooks && (
          <>
            <LibraryFilters
              searchQuery={lib.searchQuery}
              setSearchQuery={lib.setSearchQuery}
              formatFilter={lib.formatFilter}
              setFormatFilter={lib.setFormatFilter}
              formats={lib.formats}
              sortOrder={lib.sortOrder}
              setSortOrder={lib.setSortOrder}
            />

            <LibraryResultsBar
              isFiltered={lib.isFiltered}
              totalResults={lib.filteredBooks.length}
              onClearFilters={lib.handleClearFilters}
            />
          </>
        )}

        {lib.isLoading ? (
          <LibrarySkeleton />
        ) : !hasBooks ? (
          <LibraryEmpty />
        ) : lib.filteredBooks.length === 0 ? (
          <LibraryNoResults onClearFilters={lib.handleClearFilters} />
        ) : (
          <BookGrid
            books={lib.filteredBooks}
            formatMap={lib.formatMap}
            fontMap={lib.fontMap}
          />
        )}
      </div>
    </AppShell>
  );
}
