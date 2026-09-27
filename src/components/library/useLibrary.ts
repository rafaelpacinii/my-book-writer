"use client";

import { useMemo, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useBooks } from "@/hooks/useBooks";
import { useCatalog } from "@/hooks/useCatalog";
import type { Book } from "@/types/book";

export function useLibrary() {
  const { profile } = useProfile();
  const { books, isLoading: isBooksLoading } = useBooks(profile?.id);
  const { formats, fonts, isLoading: isCatalogLoading } = useCatalog();

  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"recent" | "title">("recent");

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

    if (sortOrder === "title") {
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
    isFiltered,
    handleClearFilters,
    isLoading: isBooksLoading || isCatalogLoading,
  };
}
