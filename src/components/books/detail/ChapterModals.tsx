import React from "react";
import { NewChapterModal } from "./NewChapterModal";
import { RenameChapterModal } from "./RenameChapterModal";
import { ChapterDeleteConfirmModal } from "./ChapterDeleteConfirmModal";
import type { ChapterSummary } from "@/types/chapter";

interface Props {
  isNewOpen: boolean;
  onNewClose: () => void;
  onNewCreate: (title: string) => Promise<void>;
  chapterToRename: ChapterSummary | null;
  onRenameClose: () => void;
  onRenameConfirm: (newTitle: string) => void;
  chapterToDelete: ChapterSummary | null;
  onDeleteClose: () => void;
  onDeleteConfirm: () => void;
}

export function ChapterModals({
  isNewOpen,
  onNewClose,
  onNewCreate,
  chapterToRename,
  onRenameClose,
  onRenameConfirm,
  chapterToDelete,
  onDeleteClose,
  onDeleteConfirm,
}: Props) {
  return (
    <>
      <NewChapterModal
        isOpen={isNewOpen}
        onClose={onNewClose}
        onCreate={onNewCreate}
      />
      <RenameChapterModal
        chapter={chapterToRename}
        onClose={onRenameClose}
        onConfirm={onRenameConfirm}
      />
      <ChapterDeleteConfirmModal
        chapter={chapterToDelete}
        onClose={onDeleteClose}
        onConfirm={onDeleteConfirm}
      />
    </>
  );
}
