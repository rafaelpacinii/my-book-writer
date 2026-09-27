"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createChapter,
  deleteChapter,
  listChapters,
  reorderChapters,
  updateChapterTitle,
} from "@/lib/api/chapters";
import type { Chapter, ChapterSummary } from "@/types/chapter";

export interface UseChaptersReturn {
  chapters: ChapterSummary[];
  isLoading: boolean;
  error: string | null;
  refreshChapters: () => Promise<void>;
  addChapter: (title: string) => Promise<Chapter>;
  renameChapter: (id: string, newTitle: string) => Promise<Chapter>;
  reorderChaptersList: (newOrderIds: string[]) => Promise<void>;
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

  const renameChapter = useCallback(
    async (id: string, newTitle: string): Promise<Chapter> => {
      setError(null);
      try {
        const updated = await updateChapterTitle(id, newTitle.trim());
        setChapters((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, title: updated.title, updated_at: updated.updated_at } : c
          )
        );
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        throw err;
      }
    },
    []
  );

  const reorderChaptersList = useCallback(
    async (newOrderIds: string[]): Promise<void> => {
      if (!bookId) return;
      setError(null);
      // Otimisticamente atualiza as posições no estado local
      setChapters((prev) => {
        const map = new Map(prev.map((c) => [c.id, c]));
        return newOrderIds
          .map((id, index) => {
            const item = map.get(id);
            return item ? { ...item, position: index } : null;
          })
          .filter((c): c is ChapterSummary => c !== null);
      });

      try {
        await reorderChapters(bookId, newOrderIds);
      } catch (err) {
        void refreshChapters();
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        throw err;
      }
    },
    [bookId, refreshChapters]
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
    renameChapter,
    reorderChaptersList,
    removeChapter,
  };
}
