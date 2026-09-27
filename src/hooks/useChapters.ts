"use client";

import { useCallback, useEffect, useState } from "react";
import { createChapter, deleteChapter, listChapters } from "@/lib/api/chapters";
import type { Chapter, ChapterSummary } from "@/types/chapter";

export interface UseChaptersReturn {
  chapters: ChapterSummary[];
  isLoading: boolean;
  error: string | null;
  refreshChapters: () => Promise<void>;
  addChapter: (title: string) => Promise<Chapter>;
  removeChapter: (id: string) => Promise<void>;
}

export function useChapters(bookId?: string | null): UseChaptersReturn {
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(bookId));
  const [error, setError] = useState<string | null>(null);

  const refreshChapters = useCallback(async () => {
    if (!bookId) {
      setChapters([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await listChapters(bookId);
      setChapters(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [bookId]);

  const addChapter = useCallback(
    async (title: string): Promise<Chapter> => {
      if (!bookId) throw new Error("ID do livro não fornecido");
      setError(null);
      try {
        const newChapter = await createChapter({ book_id: bookId, title: title.trim() });
        const summary: ChapterSummary = {
          id: newChapter.id,
          book_id: newChapter.book_id,
          title: newChapter.title,
          position: newChapter.position,
          content_revision: newChapter.content_revision,
          track_changes_enabled: newChapter.track_changes_enabled,
          created_at: newChapter.created_at,
          updated_at: newChapter.updated_at,
        };
        setChapters((prev) => [...prev, summary]);
        return newChapter;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        throw err;
      }
    },
    [bookId]
  );

  const removeChapter = useCallback(async (id: string): Promise<void> => {
    setError(null);
    try {
      await deleteChapter(id);
      setChapters((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    }
  }, []);

  useEffect(() => {
    void refreshChapters();
  }, [refreshChapters]);

  return {
    chapters,
    isLoading,
    error,
    refreshChapters,
    addChapter,
    removeChapter,
  };
}
