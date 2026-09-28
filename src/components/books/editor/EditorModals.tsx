import React from "react";
import { QuickNewChapterModal } from "./QuickNewChapterModal";
import { DeleteChapterModal } from "./DeleteChapterModal";

interface Props {
  isNewOpen: boolean;
  onCloseNew: () => void;
  onCreateNew: (title: string) => Promise<void>;
  isDeleteOpen: boolean;
  onCloseDelete: () => void;
  onConfirmDelete: () => Promise<void>;
  chapterTitle: string;
}

export function EditorModals({
  isNewOpen, onCloseNew, onCreateNew,
  isDeleteOpen, onCloseDelete, onConfirmDelete, chapterTitle,
}: Props) {
  return (
    <>
      <QuickNewChapterModal
        isOpen={isNewOpen}
        onClose={onCloseNew}
        onCreate={onCreateNew}
      />
      <DeleteChapterModal
        isOpen={isDeleteOpen}
        onClose={onCloseDelete}
        onConfirm={onConfirmDelete}
        chapterTitle={chapterTitle}
      />
    </>
  );
}
