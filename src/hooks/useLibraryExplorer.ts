"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLibraryDisplay } from "@/hooks/useLibraryDisplay";
import { libraryCollections, libraryEntries, libraryScope, filterLibraryEntries } from "@/utils/libraryExplorer";
import type { Book } from "@/types/book";
import type { BookSeries } from "@/types/series";
import type { Universe } from "@/types/universe";
import type { LibrarySort, LibraryTypeFilter } from "@/types/library";
import { libraryTypeEntries } from "@/utils/libraryTypeFilter";

export function useLibraryExplorer(books: Book[], series: BookSeries[], universes: Universe[]) {
  const params = useSearchParams();
  const display = useLibraryDisplay();
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<LibrarySort>("recent");
  const [typeFilter, setTypeFilter] = useState<LibraryTypeFilter>("all");
  const collections = useMemo(() => libraryCollections(books, series, universes), [books, series, universes]);
  const scope = libraryScope(collections, params.get("seriesId"), params.get("universeId"));
  const scopedEntries = libraryEntries(books, collections, scope);
  const typedEntries = libraryTypeEntries(books, collections, scope, scopedEntries, typeFilter);
  const entries = filterLibraryEntries(typedEntries, { searchQuery, formatFilter, sortOrder }, scope.kind === "series");
  return {
    ...display, collections, scope, scopedEntries, entries,
    searchQuery, setSearchQuery, formatFilter, setFormatFilter, sortOrder, setSortOrder, typeFilter, setTypeFilter,
    isFiltered: Boolean(searchQuery.trim() || formatFilter || (scope.kind !== "series" && typeFilter !== "all")),
    handleClearFilters: () => { setSearchQuery(""); setFormatFilter(""); setTypeFilter("all"); },
  };
}
