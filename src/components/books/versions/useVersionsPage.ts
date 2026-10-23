"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getBookById } from "@/lib/api/books";
import { getChapterById } from "@/lib/api/chapters";
import { createChapterVersion, deleteChapterVersion, getChapterVersion, listChapterVersions, restoreChapterVersion } from "@/lib/api/versions";
import { extractPlainText, parseChapterText } from "@/utils/chapterContent";
import { computeWordDiff, indexDiffChanges } from "@/utils/textDiff";
import { historyError } from "@/utils/versionHistory";
import type { Chapter } from "@/types/chapter";
import type { ChapterVersion, ChapterVersionSummary } from "@/types/chapterVersion";
import type { CompareBase, DiffLayoutMode, VersionsPageState } from "./types";

interface HistoryData {
  bookTitle: string;
  chapter: Chapter;
  versions: ChapterVersionSummary[];
  selected: ChapterVersion | null;
  previous: ChapterVersion | null;
}

export function useVersionsPage(bookId: string, chapterId: string, initialVersionId?: string): VersionsPageState {
  const router = useRouter();
  const [data, setData] = useState<HistoryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [base, setBase] = useState<CompareBase>("current");
  const [layoutMode, setLayoutMode] = useState<DiffLayoutMode>("unified");
  const [activeChangeIndex, setActiveChangeIndex] = useState(0);
  const reload = useCallback(() => setRefresh((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setActiveChangeIndex(0);
    const load = async () => {
      if (!bookId || !chapterId) throw new Error("Selecione um livro e um capítulo para abrir o histórico.");
      const [book, chapter, versions] = await Promise.all([getBookById(bookId), getChapterById(chapterId), listChapterVersions(chapterId)]);
      if (!book || book.deleted_at || !chapter || chapter.book_id !== bookId) throw new Error("O livro ou capítulo não foi encontrado.");
      const target = initialVersionId ? versions.find((v) => v.id === initialVersionId) : versions[0];
      if (initialVersionId && !target) throw new Error("Esta versão não foi encontrada. Volte ao editor e atualize o histórico.");
      const index = versions.findIndex((v) => v.id === target?.id);
      // Carrega a versão anterior quando a snapshot selecionada muda.
      const [selected, previous] = await Promise.all([
        target ? getChapterVersion(target.id) : null,
        index >= 0 && versions[index + 1] ? getChapterVersion(versions[index + 1].id) : null,
      ]);
      if ((target && !selected) || (selected && selected.chapter_id !== chapterId) || (previous && previous.chapter_id !== chapterId)) {
        throw new Error("Não foi possível carregar esta versão. Atualize o histórico.");
      }
      if (active) setData({ bookTitle: book.title, chapter, versions, selected, previous });
    };
    void load().catch((cause) => { if (active) { setError(historyError(cause)); setData(null); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [bookId, chapterId, initialVersionId, refresh]);

  const compareBase = base === "previous" && data?.previous ? "previous" : "current";
  const currentContentHtml = data ? parseChapterText(data.chapter.content_json) : "";
  const diffResult = useMemo(() => {
    const oldVersion = compareBase === "previous" ? data?.previous : data?.selected;
    const oldText = oldVersion ? extractPlainText(parseChapterText(oldVersion.content_json)) : "";
    const newText = compareBase === "previous" ? extractPlainText(parseChapterText(data?.selected?.content_json)) : extractPlainText(currentContentHtml);
    return data?.selected ? indexDiffChanges(computeWordDiff(oldText, newText)) : indexDiffChanges([]);
  }, [data, compareBase, currentContentHtml]);

  const setVersionUrl = (id?: string) => {
    const params = new URLSearchParams({ bookId, chapterId });
    if (id) params.set("versionId", id);
    router.replace(`/books/versions?${params}`, { scroll: false });
  };
  const selectVersion = async (id: string) => { setVersionUrl(id); };
  const setCompareBase = (value: CompareBase) => { setBase(value); setActiveChangeIndex(0); };
  const navigateChange = (direction: number) => {
    const count = diffResult.totalChanges;
    if (!count) return;
    const next = activeChangeIndex === 0 ? direction > 0 ? 1 : count : ((activeChangeIndex - 1 + direction + count) % count) + 1;
    setActiveChangeIndex(next);
    document.querySelector(`[data-change-id="change-${next}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const restoreCurrentVersion = async (): Promise<boolean> => {
    if (!data?.selected || isLoading) return false;
    await restoreChapterVersion(chapterId, data.selected.id, data.chapter.content_revision);
    router.push(`/books/editor?bookId=${encodeURIComponent(bookId)}&chapterId=${encodeURIComponent(chapterId)}`);
    return true;
  };
  const deleteVersion = async (id: string) => {
    await deleteChapterVersion(id);
    if (initialVersionId === id) setVersionUrl(data?.versions.find((v) => v.id !== id)?.id);
    reload();
  };
  const createVersion = async () => { await createChapterVersion(chapterId); reload(); };
  return {
    bookId, chapterId, bookTitle: data?.bookTitle ?? "", chapterTitle: data?.chapter.title ?? "", currentContentHtml,
    versions: data?.versions ?? [], selectedVersion: data?.selected ?? null, previousVersion: data?.previous ?? null,
    compareBase, layoutMode, isLoading, error, reload, createVersion, diffResult, activeChangeIndex,
    setCompareBase, setLayoutMode, selectVersion, nextChange: () => navigateChange(1), prevChange: () => navigateChange(-1),
    restoreCurrentVersion, deleteVersion,
  };
}
