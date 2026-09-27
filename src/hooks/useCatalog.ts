"use client";

import { useCallback, useEffect, useState } from "react";
import { listBookFormats, listFontPresets } from "@/lib/api/catalog";
import type { BookFormat, FontPreset } from "@/types/catalog";

export interface UseCatalogReturn {
  formats: BookFormat[];
  fonts: FontPreset[];
  isLoading: boolean;
  error: string | null;
  refreshCatalog: () => Promise<void>;
}

export function useCatalog(): UseCatalogReturn {
  const [formats, setFormats] = useState<BookFormat[]>([]);
  const [fonts, setFonts] = useState<FontPreset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCatalog = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedFormats, fetchedFonts] = await Promise.all([
        listBookFormats(),
        listFontPresets(),
      ]);
      setFormats(fetchedFormats);
      setFonts(fetchedFonts);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCatalog();
  }, [refreshCatalog]);

  return {
    formats,
    fonts,
    isLoading,
    error,
    refreshCatalog,
  };
}
