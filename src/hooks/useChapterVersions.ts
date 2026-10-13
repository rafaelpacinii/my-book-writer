"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createChapterVersion,
  deleteChapterVersion,
  getChapterVersion,
  listChapterVersions,
  restoreChapterVersion,
  setChapterTrackChanges,
} from "@/lib/api/versions";
import type { ChapterVersion, ChapterVersionSummary } from "@/types/chapterVersion";
import type { Chapter } from "@/types/chapter";

export function useChapterVersions(chapterId: string, initialTrackChanges = false) {
  const [versions, setVersions] = useState<ChapterVersionSummary[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ChapterVersion | null>(null);
  const [trackChanges, setTrackChanges] = useState(initialTrackChanges);
  const [isLoading, setIsLoading] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    setTrackChanges(initialTrackChanges);
  }, [initialTrackChanges]);

  const loadVersions = useCallback(async () => {
    if (!chapterId) return;
    setIsLoading(true);
    try {
      const list = await listChapterVersions(chapterId);
      setVersions(list);
    } finally {
      setIsLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    void loadVersions();
  }, [loadVersions]);

  const handleCreateSnapshot = useCallback(
    async (description?: string) => {
      if (!chapterId) return;
      await createChapterVersion(chapterId, description);
      await loadVersions();
    },
    [chapterId, loadVersions],
  );

  const handleSelectVersion = useCallback(async (versionId: string) => {
    setIsLoading(true);
    try {
      const ver = await getChapterVersion(versionId);
      setSelectedVersion(ver);
      setIsComparing(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRestoreVersion = useCallback(
    async (versionId: string): Promise<Chapter | null> => {
      if (!chapterId) return null;
      const restored = await restoreChapterVersion(chapterId, versionId);
      await loadVersions();
      setIsComparing(false);
      setSelectedVersion(null);
      return restored;
    },
    [chapterId, loadVersions],
  );

  const handleDeleteVersion = useCallback(
    async (versionId: string) => {
      await deleteChapterVersion(versionId);
      if (selectedVersion?.id === versionId) {
        setSelectedVersion(null);
        setIsComparing(false);
      }
      await loadVersions();
    },
    [selectedVersion, loadVersions],
  );

  const handleToggleTrackChanges = useCallback(
    async (enabled: boolean) => {
      if (!chapterId) return;
      await setChapterTrackChanges(chapterId, enabled);
      setTrackChanges(enabled);
    },
    [chapterId],
  );

  return {
    versions,
    selectedVersion,
    trackChanges,
    isLoading,
    isComparing,
    setIsComparing,
    setSelectedVersion,
    handleCreateSnapshot,
    handleSelectVersion,
    handleRestoreVersion,
    handleDeleteVersion,
    handleToggleTrackChanges,
    refreshVersions: loadVersions,
  };
}

