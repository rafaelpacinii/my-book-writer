"use client";

import { useEffect, useState, useCallback } from "react";
import { getBookFrontMatter, saveBookFrontMatter } from "@/lib/api/frontMatter";
import type { BookFrontMatter, SaveFrontMatterInput } from "@/types/frontMatter";

export function useFrontMatter(bookId: string) {
  const [data, setData] = useState<BookFrontMatter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!bookId) { setData(null); setIsLoading(false); return; }
    setIsLoading(true);
    setError(null);
    try {
      const res = await getBookFrontMatter(bookId);
      setData(res);
    } catch {
      setError("Não foi possível carregar as páginas iniciais. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (input: SaveFrontMatterInput) => {
      setIsSaving(true);
      setError(null);
      try {
        const updated = await saveBookFrontMatter(input);
        setData(updated);
        return true;
      } catch {
        setError("Não foi possível salvar as páginas iniciais. Suas alterações foram mantidas; tente novamente.");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  return { data, isLoading, isSaving, error, save, reload: load };
}

