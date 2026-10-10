"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PreviewChapter } from "@/types/preview";
import { chapterStarts, locatePage, totalPages } from "@/utils/previewPages";

function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName);
}

export function usePreviewPages(chapters: PreviewChapter[], frontMatterCount = 0) {
  const [measured, setMeasured] = useState<Record<string, number>>({});
  const [requested, setRequested] = useState(1);
  const ready = chapters.every((chapter) => measured[chapter.id] !== undefined);
  const counts = useMemo(() => chapters.map((chapter) => measured[chapter.id] ?? 1), [chapters, measured]);
  const chaptersTotal = ready ? totalPages(counts) : 0;
  const total = Math.max(1, frontMatterCount + chaptersTotal);
  const page = Math.max(1, Math.min(requested, total));

  const isFrontMatter = page <= frontMatterCount;
  const frontMatterIndex = isFrontMatter ? page - 1 : -1;
  const chapterLocation = useMemo(() => {
    if (isFrontMatter) return { chapterIndex: 0, page: 1 };
    return locatePage(counts, page - frontMatterCount);
  }, [isFrontMatter, counts, page, frontMatterCount]);

  const reportCount = useCallback((id: string, count: number) => {
    setMeasured((prev) => (prev[id] === count ? prev : { ...prev, [id]: count }));
  }, []);

  const goToPage = useCallback((target: number) => {
    setRequested(Math.max(1, Math.min(target, total)));
  }, [total]);

  const goToChapter = (index: number) => {
    setRequested(frontMatterCount + (chapterStarts(counts)[index] ?? 0) + 1);
  };

  const goToFrontMatter = (index: number) => {
    setRequested(index + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") goToPage(page + 1);
      else if (e.key === "ArrowLeft" || e.key === "PageUp") goToPage(page - 1);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goToPage, page]);

  return {
    ready, total, page, counts, isFrontMatter, frontMatterIndex,
    location: chapterLocation, reportCount, goToPage, goToChapter, goToFrontMatter,
  };
}
