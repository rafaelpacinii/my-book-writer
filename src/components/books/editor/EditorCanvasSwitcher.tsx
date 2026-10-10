import React from "react";
import { EditorSheet } from "./EditorSheet";
import { EditorPagedSheet } from "./EditorPagedSheet";
import type { Book } from "@/types/book";
import type { BookFormat, FontPreset } from "@/types/catalog";
import type { ChapterSummary } from "@/types/chapter";

interface Props {
  viewMode: "continuous" | "paged";
  book: Book | null;
  format?: BookFormat;
  font?: FontPreset;
  bookId: string;
  chapterNumber: string;
  title: string;
  onTitleChange: (v: string) => void;
  contentRef: React.RefObject<HTMLDivElement | null>;
  text: string;
  onTextChange: (v: string) => void;
  onSelectionChange: () => void;
  prevChapter: ChapterSummary | null;
  nextChapter: ChapterSummary | null;
  isFocusMode: boolean;
  onExitFocus: () => void;
  isFitMode: boolean;
  onFitModeChange: (fit: boolean) => void;
}

export function EditorCanvasSwitcher(p: Props) {
  if (p.viewMode === "paged") {
    return (
      <EditorPagedSheet
        book={p.book} format={p.format} font={p.font} chapterNumber={p.chapterNumber} title={p.title}
        contentRef={p.contentRef} initialContent={p.text} onContentChange={p.onTextChange}
        onSelectionChange={p.onSelectionChange} isFocusMode={p.isFocusMode} onExitFocus={p.onExitFocus}
        isFitMode={p.isFitMode} onFitModeChange={p.onFitModeChange}
      />
    );
  }

  return (
    <EditorSheet
      chapterNumber={p.chapterNumber} title={p.title} onTitleChange={p.onTitleChange}
      contentRef={p.contentRef} initialContent={p.text} onContentChange={p.onTextChange}
      onSelectionChange={p.onSelectionChange} bookId={p.bookId}
      prevChapter={p.prevChapter} nextChapter={p.nextChapter}
      isFocusMode={p.isFocusMode} onExitFocus={p.onExitFocus}
    />
  );
}
