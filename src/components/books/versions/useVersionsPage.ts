"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getBookById } from "@/lib/api/books";
import { getChapterById } from "@/lib/api/chapters";
import {
  deleteChapterVersion,
  getChapterVersion,
  listChapterVersions,
  restoreChapterVersion,
} from "@/lib/api/versions";
import { extractPlainText, parseChapterText } from "@/utils/chapterContent";
import { computeWordDiff, indexDiffChanges } from "@/utils/textDiff";
import type { ChapterVersion, ChapterVersionSummary } from "@/types/chapterVersion";
import type { CompareBase, DiffLayoutMode, VersionsPageState } from "./types";

export function useVersionsPage(
  bookId: string,
  chapterId: string,
  initialVersionId?: string
): VersionsPageState {
  const router = useRouter();
  const [bookTitle, setBookTitle] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [currentContentHtml, setCurrentContentHtml] = useState("");
  const [versions, setVersions] = useState<ChapterVersionSummary[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ChapterVersion | null>(null);
  const [previousVersion, setPreviousVersion] = useState<ChapterVersion | null>(null);
  const [compareBase, setCompareBase] = useState<CompareBase>("current");
  const [layoutMode, setLayoutMode] = useState<DiffLayoutMode>("unified");
  const [isLoading, setIsLoading] = useState(true);
  const [activeChangeIndex, setActiveChangeIndex] = useState(0);

  const loadData = useCallback(async () => {
    if (!bookId || !chapterId) return;
    setIsLoading(true);
    try {
      const [book, chapter, vers] = await Promise.all([
        getBookById(bookId),
        getChapterById(chapterId),
        listChapterVersions(chapterId),
      ]);
      if (book) setBookTitle(book.title);
      if (chapter) {
        setChapterTitle(chapter.title);
        setCurrentContentHtml(parseChapterText(chapter.content_json));
      }
      setVersions(vers);
      if (vers.length > 0) {
        const targetId =
          initialVersionId && vers.some((v) => v.id === initialVersionId)
            ? initialVersionId
            : vers[0].id;
        const fullVer = await getChapterVersion(targetId);
        setSelectedVersion(fullVer);
      }
    } finally {
      setIsLoading(false);
    }
  }, [bookId, chapterId, initialVersionId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Carrega a versão anterior quando a snapshot selecionada muda
  useEffect(() => {
    if (!selectedVersion || versions.length === 0) {
      setPreviousVersion(null);
      return;
    }
    const idx = versions.findIndex((v) => v.id === selectedVersion.id);
    const prevSummary = idx >= 0 && idx < versions.length - 1 ? versions[idx + 1] : null;
    if (prevSummary) {
      void getChapterVersion(prevSummary.id).then(setPreviousVersion);
    } else {
      setPreviousVersion(null);
    }
  }, [selectedVersion, versions]);

  const selectVersion = useCallback(async (versionId: string) => {
    setIsLoading(true);
    try {
      const ver = await getChapterVersion(versionId);
      setSelectedVersion(ver);
      setActiveChangeIndex(0);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("versionId", versionId);
        window.history.replaceState({}, "", url.toString());
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const diffResult = useMemo(() => {
    if (!selectedVersion) {
      return { parts: [], totalChanges: 0, additions: 0, deletions: 0 };
    }
    let oldRaw = "";
    let newRaw = "";

    if (compareBase === "current") {
      oldRaw = extractPlainText(parseChapterText(selectedVersion.content_json));
      newRaw = extractPlainText(currentContentHtml);
    } else {
      oldRaw = previousVersion
        ? extractPlainText(parseChapterText(previousVersion.content_json))
        : "";
      newRaw = extractPlainText(parseChapterText(selectedVersion.content_json));
    }

    const diff = computeWordDiff(oldRaw, newRaw);
    return indexDiffChanges(diff);
  }, [selectedVersion, compareBase, currentContentHtml, previousVersion]);

  const scrollToChange = useCallback((changeIdx: number) => {
    if (typeof document === "undefined" || changeIdx <= 0) return;
    const target = document.querySelector(`[data-change-id="change-${changeIdx}"]`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const nextChange = useCallback(() => {
    if (diffResult.totalChanges === 0) return;
    const next = activeChangeIndex >= diffResult.totalChanges ? 1 : activeChangeIndex + 1;
    setActiveChangeIndex(next);
    scrollToChange(next);
  }, [activeChangeIndex, diffResult.totalChanges, scrollToChange]);

  const prevChange = useCallback(() => {
    if (diffResult.totalChanges === 0) return;
    const prev = activeChangeIndex <= 1 ? diffResult.totalChanges : activeChangeIndex - 1;
    setActiveChangeIndex(prev);
    scrollToChange(prev);
  }, [activeChangeIndex, diffResult.totalChanges, scrollToChange]);

  const restoreCurrentVersion = useCallback(async (): Promise<boolean> => {
    if (!selectedVersion || !chapterId) return false;
    await restoreChapterVersion(chapterId, selectedVersion.id);
    router.push(`/books/editor?bookId=${encodeURIComponent(bookId)}&chapterId=${encodeURIComponent(chapterId)}`);
    return true;
  }, [selectedVersion, chapterId, bookId, router]);

  const deleteVersion = useCallback(
    async (versionId: string) => {
      await deleteChapterVersion(versionId);
      const remaining = versions.filter((v) => v.id !== versionId);
      setVersions(remaining);
      if (selectedVersion?.id === versionId) {
        if (remaining.length > 0) {
          const nextVer = await getChapterVersion(remaining[0].id);
          setSelectedVersion(nextVer);
        } else {
          setSelectedVersion(null);
        }
      }
    },
    [selectedVersion, versions]
  );

  return {
    bookId, chapterId, bookTitle, chapterTitle, currentContentHtml,
    versions, selectedVersion, previousVersion, compareBase, layoutMode,
    isLoading, diffResult, activeChangeIndex,
    setCompareBase, setLayoutMode, selectVersion,
    nextChange, prevChange, restoreCurrentVersion, deleteVersion,
  };
}

