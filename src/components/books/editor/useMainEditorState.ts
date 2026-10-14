"use client";

import React, { useState } from "react";
import { useChapterEditor } from "./useChapterEditor";
import { useReview } from "@/hooks/useReview";
import { useChapterVersions } from "@/hooks/useChapterVersions";
import { formatChapterHeadingLabel } from "@/utils/chapterType";
import { matchesShortcut } from "@/utils/keyboardShortcuts";
import type { MainEditorState } from "./mainTypes";

export function useMainEditorState(bookId: string, chapterId: string): MainEditorState {
  const ed = useChapterEditor(bookId, chapterId);
  const rev = useReview(chapterId, ed.chapter?.content_revision ?? 1);
  const ver = useChapterVersions(chapterId, ed.chapter?.track_changes_enabled ?? false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isVersionOpen, setIsVersionOpen] = useState(false);

  React.useEffect(() => {
    if (ed.lastSavedAt && ver.trackChanges) {
      void ver.refreshVersions();
    }
  }, [ed.lastSavedAt, ver.trackChanges, ver.refreshVersions]);

  React.useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (matchesShortcut(e, ed.preferences.shortcuts.focusMode)) {
        e.preventDefault();
        ed.setIsFocusMode((prev) => !prev);
      } else if (matchesShortcut(e, ed.preferences.shortcuts.versionsDrawer)) {
        e.preventDefault();
        setIsVersionOpen((prev) => !prev);
      } else if (matchesShortcut(e, ed.preferences.shortcuts.reviewDrawer)) {
        e.preventDefault();
        setIsReviewOpen((prev) => !prev);
      } else if (matchesShortcut(e, ed.preferences.shortcuts.newChapter)) {
        e.preventDefault();
        ed.setIsNewChapterModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [ed.preferences.shortcuts, ed.setIsFocusMode, ed.setIsNewChapterModalOpen]);

  const standardIndex = ed.chapters
    .slice(0, ed.currentIndex)
    .filter((c) => (c.chapter_type || "standard") === "standard").length;
  const headingNumber = formatChapterHeadingLabel(ed.chapter || { chapter_type: "standard" }, standardIndex);

  return {
    ed, rev, ver,
    isReviewOpen, setIsReviewOpen,
    isVersionOpen, setIsVersionOpen,
    headingNumber,
  };
}

