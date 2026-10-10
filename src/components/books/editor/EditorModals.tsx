import React from "react";
import { QuickNewChapterModal } from "./QuickNewChapterModal";
import { DeleteChapterModal } from "./DeleteChapterModal";
import { EditorSettingsModal } from "./EditorSettingsModal";
import type { Book, UpdateBookInput } from "@/types/book";
import type { BookFormat, FontPreset } from "@/types/catalog";

interface Props {
  isNewOpen: boolean;
  onCloseNew: () => void;
  onCreateNew: (title: string) => Promise<void>;
  isDeleteOpen: boolean;
  onCloseDelete: () => void;
  onConfirmDelete: () => Promise<void>;
  chapterTitle: string;
  isSettingsOpen: boolean;
  onCloseSettings: () => void;
  book: Book | null;
  formats: BookFormat[];
  fonts: FontPreset[];
  onSaveSettings: (input: UpdateBookInput) => Promise<boolean>;
}

export function EditorModals(p: Props) {
  return (
    <>
      <QuickNewChapterModal isOpen={p.isNewOpen} onClose={p.onCloseNew} onCreate={p.onCreateNew} />
      <DeleteChapterModal isOpen={p.isDeleteOpen} onClose={p.onCloseDelete} onConfirm={p.onConfirmDelete} chapterTitle={p.chapterTitle} />
      <EditorSettingsModal isOpen={p.isSettingsOpen} onClose={p.onCloseSettings} book={p.book} formats={p.formats} fonts={p.fonts} onSave={p.onSaveSettings} />
    </>
  );
}
