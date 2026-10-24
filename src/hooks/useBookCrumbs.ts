"use client";

import { useSeries } from "@/hooks/useSeries";
import { useUniverses } from "@/hooks/useUniverses";
import { libraryAncestorCrumbs } from "@/utils/libraryBreadcrumbs";
import type { Book } from "@/types/book";

export function useBookCrumbs(book: Book | null) {
  const { series } = useSeries(book?.series_id ? book.profile_id : null);
  const { universes } = useUniverses(book?.series_id || book?.universe_id ? book.profile_id : null);
  return libraryAncestorCrumbs(book?.series_id, book?.universe_id, series, universes);
}
