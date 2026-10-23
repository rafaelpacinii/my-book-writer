"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { checkpointChapterHistory, createChapterVersion, deleteChapterVersion, listChapterVersions, setChapterTrackChanges } from "@/lib/api/versions";
import { historyError } from "@/utils/versionHistory";
import type { ChapterVersionSummary } from "@/types/chapterVersion";

export function useChapterVersions(chapterId: string, initialTrackChanges = false) {
  const [versions, setVersions] = useState<ChapterVersionSummary[]>([]);
  const [loadedChapterId, setLoadedChapterId] = useState(chapterId);
  const [trackChanges, setTrackChanges] = useState(initialTrackChanges);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const context = useRef(chapterId);
  context.current = chapterId;
  const request = useRef(0);
  const cancelLoad = useCallback(() => { request.current++; }, []);

  useEffect(() => { setTrackChanges(initialTrackChanges); }, [chapterId, initialTrackChanges]);
  const loadVersions = useCallback(async () => {
    const token = ++request.current;
    if (!chapterId) { setVersions([]); setLoading(false); return; }
    setLoading(true);
    try {
      const list = await listChapterVersions(chapterId);
      if (context.current === chapterId && token === request.current) { setVersions(list); setLoadedChapterId(chapterId); setError(null); }
    } catch (cause) {
      if (context.current === chapterId && token === request.current) setError(historyError(cause));
    } finally {
      if (context.current === chapterId && token === request.current) setLoading(false);
    }
  }, [chapterId]);
  useEffect(() => {
    setVersions([]);
    setError(null);
    void loadVersions();
    return cancelLoad;
  }, [loadVersions, cancelLoad]);

  useEffect(() => {
    if (!trackChanges || !chapterId) return;
    let active = true, pending = false;
    const timer = setInterval(async () => {
      if (pending) return;
      pending = true;
      try {
        await checkpointChapterHistory(chapterId);
        if (active) await loadVersions();
      } catch (cause) { if (active) setError(historyError(cause)); }
      finally { pending = false; }
    }, 30_000);
    return () => { active = false; clearInterval(timer); };
  }, [chapterId, trackChanges, loadVersions]);

  const handleCreateSnapshot = async (description?: string) => {
    await createChapterVersion(chapterId, description);
    await loadVersions();
  };
  const handleDeleteVersion = async (versionId: string) => {
    await deleteChapterVersion(versionId);
    await loadVersions();
  };
  const handleToggleTrackChanges = async (enabled: boolean) => {
    await setChapterTrackChanges(chapterId, enabled);
    if (context.current === chapterId) setTrackChanges(enabled);
    await loadVersions();
  };
  return { versions: loadedChapterId === chapterId ? versions : [], trackChanges,
    isLoading, error, handleCreateSnapshot, handleDeleteVersion, handleToggleTrackChanges, refreshVersions: loadVersions };
}
