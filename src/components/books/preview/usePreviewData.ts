"use client";

import { useEffect, useMemo, useState } from "react";
import { getBookById } from "@/lib/api/books";
import { getChapterById, listChapters } from "@/lib/api/chapters";
import { getBookFrontMatter } from "@/lib/api/frontMatter";
import { sanitizeHtml } from "@/lib/editor/sanitizeHtml";
import { useCatalog } from "@/hooks/useCatalog";
import { countWords, parseChapterText } from "@/utils/chapterContent";
import { getPhysicalPageDimensions } from "@/utils/bookPagination";
import { buildFrontMatterPages } from "@/utils/frontMatterPages";
import { formatChapterHeadingLabel } from "@/utils/chapterType";
import type { Book } from "@/types/book";
import type { PreviewChapter } from "@/types/preview";
import type { BookFrontMatter } from "@/types/frontMatter";

async function loadChapters(bookId: string): Promise<PreviewChapter[]> {
  const summaries = await listChapters(bookId);
  const full = await Promise.all(summaries.map((s) => getChapterById(s.id)));
  return summaries.map((s, idx) => {
    const html = sanitizeHtml(parseChapterText(full[idx]?.content_json));
    const stdIdx = summaries.slice(0, idx).filter((c) => (c.chapter_type || "standard") === "standard").length;
    return {
      id: s.id,
      number: formatChapterHeadingLabel(s, stdIdx),
      title: s.title,
      chapter_type: s.chapter_type,
      custom_type_name: s.custom_type_name,
      html,
      words: countWords(html),
    };
  });
}

export function usePreviewData(bookId: string) {
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<PreviewChapter[]>([]);
  const [frontMatter, setFrontMatter] = useState<BookFrontMatter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const catalog = useCatalog();

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    Promise.all([getBookById(bookId), loadChapters(bookId), getBookFrontMatter(bookId)])
      .then(([b, chaps, fm]) => {
        if (!active) return;
        setBook(b); setChapters(chaps); setFrontMatter(fm);
      })
      .catch((r: unknown) => { if (active) setError(r instanceof Error ? r.message : String(r)); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [bookId]);

  const format = catalog.formats.find((item) => item.id === book?.format_id);
  const font = catalog.fonts.find((item) => item.id === book?.font_preset_id);
  const dim = useMemo(() => getPhysicalPageDimensions(book, format, font), [book, format, font]);
  const frontMatterPages = useMemo(() => buildFrontMatterPages(frontMatter), [frontMatter]);

  return {
    book, chapters, dim, error, frontMatter, frontMatterPages,
    isLoading: isLoading || catalog.isLoading,
    words: chapters.reduce((sum, chapter) => sum + chapter.words, 0),
  };
}
