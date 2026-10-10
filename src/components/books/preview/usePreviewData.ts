"use client";

import { useEffect, useMemo, useState } from "react";
import { getBookById } from "@/lib/api/books";
import { getChapterById, listChapters } from "@/lib/api/chapters";
import { sanitizeHtml } from "@/lib/editor/sanitizeHtml";
import { useCatalog } from "@/hooks/useCatalog";
import { countWords, parseChapterText } from "@/utils/chapterContent";
import { getPhysicalPageDimensions } from "@/utils/bookPagination";
import type { Book } from "@/types/book";
import type { PreviewChapter } from "@/types/preview";

async function loadChapters(bookId: string): Promise<PreviewChapter[]> {
  const summaries = await listChapters(bookId);
  const full = await Promise.all(summaries.map((summary) => getChapterById(summary.id)));
  return summaries.map((summary, index) => {
    const html = sanitizeHtml(parseChapterText(full[index]?.content_json));
    return {
      id: summary.id,
      number: `Capítulo ${String(index + 1).padStart(2, "0")}`,
      title: summary.title,
      html,
      words: countWords(html),
    };
  });
}

export function usePreviewData(bookId: string) {
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<PreviewChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const catalog = useCatalog();

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    Promise.all([getBookById(bookId), loadChapters(bookId)])
      .then(([loadedBook, loadedChapters]) => {
        if (!active) return;
        setBook(loadedBook);
        setChapters(loadedChapters);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : String(reason));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [bookId]);

  const format = catalog.formats.find((item) => item.id === book?.format_id);
  const font = catalog.fonts.find((item) => item.id === book?.font_preset_id);
  const dim = useMemo(() => getPhysicalPageDimensions(book, format, font), [book, format, font]);

  return {
    book, chapters, dim, error,
    isLoading: isLoading || catalog.isLoading,
    words: chapters.reduce((sum, chapter) => sum + chapter.words, 0),
  };
}
