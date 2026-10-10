"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PreviewChapter } from "@/types/preview";
import { chapterStarts, clampPage, locatePage, totalPages } from "@/utils/previewPages";

function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName);
}

export function usePreviewPages(chapters: PreviewChapter[]) {
  const [measured, setMeasured] = useState<Record<string, number>>({});
  const [requested, setRequested] = useState(1);
  const ready = chapters.every((chapter) => measured[chapter.id] !== undefined);
  const counts = useMemo(() => chapters.map((chapter) => measured[chapter.id] ?? 1), [chapters, measured]);
  const total = ready ? totalPages(counts) : 0;
  const page = clampPage(requested, counts);

  const reportCount = useCallback((id: string, count: number) => {
    setMeasured((previous) => (previous[id] === count ? previous : { ...previous, [id]: count }));
  }, []);

  const goToPage = useCallback((target: number) => setRequested(clampPage(target, counts)), [counts]);
  const goToChapter = (index: number) => setRequested((chapterStarts(counts)[index] ?? 0) + 1);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === "ArrowRight" || event.key === "PageDown") goToPage(page + 1);
      else if (event.key === "ArrowLeft" || event.key === "PageUp") goToPage(page - 1);
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goToPage, page]);

  return { ready, total, page, counts, location: locatePage(counts, page), reportCount, goToPage, goToChapter };
}

