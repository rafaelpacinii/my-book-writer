"use client";

import { useMemo } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useBooks } from "@/hooks/useBooks";
import { useLibrarySeries } from "@/hooks/useLibrarySeries";
import { useLibraryUniverses } from "@/hooks/useLibraryUniverses";
import { useLibraryExplorer } from "@/hooks/useLibraryExplorer";
import { useLibraryMove } from "@/hooks/useLibraryMove";
import { useCatalog } from "@/hooks/useCatalog";
import { useLibraryInspector } from "@/hooks/useLibraryInspector";
import type { LibraryCollection } from "@/types/library";

export function useLibrary() {
  const { profile, isLoading: isProfileLoading, error: profileError, refreshProfile } = useProfile();
  const { books, isLoading: isBooksLoading, error: booksError, refreshBooks, isRefreshing: isRefreshingBooks } = useBooks(profile?.id);
  const { formats, fonts, isLoading: isCatalogLoading, error: catalogError, refreshCatalog } = useCatalog();
  const seriesManager = useLibrarySeries(profile?.id);
  const universeManager = useLibraryUniverses(profile?.id);
  const explorer = useLibraryExplorer(books, seriesManager.series, universeManager.universes);
  const inspector = useLibraryInspector(explorer.scope, explorer.entries);
  const move = useLibraryMove(books, seriesManager.series, isRefreshingBooks || seriesManager.busy || universeManager.busy
    || seriesManager.isRefreshing || universeManager.isRefreshing);
  const busy = move.busy || seriesManager.busy || universeManager.busy || isRefreshingBooks;
  const formatMap = useMemo(() => new Map(formats.map((item) => [item.id, item.name])), [formats]);
  const fontMap = useMemo(() => new Map(fonts.map((item) => [item.id, item.name])), [fonts]);
  const editCollection = (entry: LibraryCollection) => entry.kind === "series"
    ? seriesManager.open({ kind: "edit", series: entry.collection })
    : universeManager.open({ kind: "edit", universe: entry.collection });
  const deleteCollection = (entry: LibraryCollection) => entry.kind === "series"
    ? seriesManager.open({ kind: "delete", series: entry.collection })
    : universeManager.open({ kind: "delete", universe: entry.collection });
  const updateCollection = (entry: LibraryCollection, name: string, description: string) =>
    entry.kind === "series"
      ? seriesManager.updateSeries(entry.collection.id, name, description)
      : universeManager.updateUniverse(entry.collection.id, name, description);

  return {
    ...explorer, books, formats, formatMap, fontMap, seriesManager, universeManager, move, busy, inspector,
    editCollection, deleteCollection, updateCollection, isRefreshingBooks,
    error: profileError || booksError || catalogError
      || (seriesManager.dialog ? null : seriesManager.error)
      || (universeManager.dialog ? null : universeManager.error)
      || (move.movingBook || move.movingSeries ? null : move.error),
    retry: () => {
      void refreshProfile(); void refreshBooks(); void refreshCatalog();
      void seriesManager.refreshSeries(); void universeManager.refreshUniverses(); move.clearError();
    },
    isLoading: isProfileLoading || isBooksLoading || isCatalogLoading || seriesManager.isLoading || universeManager.isLoading,
  };
}
