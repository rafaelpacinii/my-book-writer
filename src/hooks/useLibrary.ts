"use client";

import { useMemo, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useBooks } from "@/hooks/useBooks";
import { useCatalog } from "@/hooks/useCatalog";

export function useLibrary() {
  const { profile, isLoading: isProfileLoading, error: profileError, refreshProfile } = useProfile();
  const { books, isLoading: isBooksLoading, error: booksError, refreshBooks } = useBooks(profile?.id);
  const { formats, fonts, isLoading: isCatalogLoading, error: catalogError, refreshCatalog } = useCatalog();

  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"recent" | "title" | "author">("recent");
  const [view, setView] = useState<"grid" | "list">("grid");

  const formatMap = useMemo(() => {
    const map = new Map<string, string>();
    formats.forEach((f) => map.set(f.id, f.name));
    return map;
  }, [formats]);

  const fontMap = useMemo(() => {
    const map = new Map<string, string>();
    fonts.forEach((f) => map.set(f.id, f.name));
    return map;
  }, [fonts]);

  const filteredBooks = useMemo(() => {
    let list = [...books];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author_name.toLowerCase().includes(q)
      );
    }

    if (formatFilter) {
      list = list.filter((b) => b.format_id === formatFilter);
    }

    if (sortOrder === "author") {
      list.sort((a, b) => a.author_name.localeCompare(b.author_name, "pt-BR"));
    } else if (sortOrder === "title") {
      list.sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
    } else {
      list.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    }

    return list;
  }, [books, searchQuery, formatFilter, sortOrder]);

  const isFiltered = Boolean(searchQuery.trim() || formatFilter);

  const handleClearFilters = () => {
    setSearchQuery("");
    setFormatFilter("");
  };

  return {
    books,
    error: profileError || booksError || catalogError,
    retry: () => { void refreshProfile(); void refreshBooks(); void refreshCatalog(); },
    filteredBooks,
    formats,
    formatMap,
    fontMap,
    searchQuery,
    setSearchQuery,
    formatFilter,
    setFormatFilter,
    sortOrder,
    setSortOrder,
    view,
    setView,
    isFiltered,
    handleClearFilters,
    isLoading: isProfileLoading || isBooksLoading || isCatalogLoading,
  };
}
