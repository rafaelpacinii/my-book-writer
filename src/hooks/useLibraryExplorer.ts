"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLibraryDisplay } from "@/hooks/useLibraryDisplay";
import { libraryCollections, libraryEntries, libraryScope, filterLibraryEntries } from "@/utils/libraryExplorer";
import type { Book } from "@/types/book";
import type { BookSeries } from "@/types/series";
import type { Universe } from "@/types/universe";
import type { LibrarySort } from "@/types/library";

export function useLibraryExplorer(books: Book[], series: BookSeries[], universes: Universe[]) {
  const params = useSearchParams();
  const display = useLibraryDisplay();
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<LibrarySort>("recent");
  const collections = useMemo(() => libraryCollections(books, series, universes), [books, series, universes]);
  const scope = libraryScope(collections, params.get("seriesId"), params.get("universeId"));
  const scopedEntries = libraryEntries(books, collections, scope);
  const entries = filterLibraryEntries(scopedEntries, { searchQuery, formatFilter, sortOrder }, scope.kind === "series");
  return {
    ...display, collections, scope, scopedEntries, entries,
    searchQuery, setSearchQuery, formatFilter, setFormatFilter, sortOrder, setSortOrder,
    isFiltered: Boolean(searchQuery.trim() || formatFilter),
    handleClearFilters: () => { setSearchQuery(""); setFormatFilter(""); },
  };
}
