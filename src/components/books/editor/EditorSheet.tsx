import React from "react";
import { EditorTitleInput } from "./EditorTitleInput";
import { EditorCanvas } from "./EditorCanvas";
import { EditorNav } from "./EditorNav";
import type { ChapterSummary } from "@/types/chapter";

interface Props {
  chapterNumber: string;
  title: string;
  onTitleChange: (v: string) => void;
  contentRef: React.RefObject<HTMLDivElement | null>;
  initialContent: string;
  onContentChange: (v: string) => void;
  fontSizePt?: number;
  fontFamily?: string;
  lineHeightRatio?: number;
  onSelectionChange?: () => void;
  bookId: string;
  prevChapter: ChapterSummary | null;
  nextChapter: ChapterSummary | null;
  isFocusMode: boolean;
  onExitFocus: () => void;
}

export function EditorSheet(props: Props) {
  return (
    <main className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center">
      <div className="w-full max-w-[720px] flex-1 flex flex-col">
        {props.isFocusMode && (
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={props.onExitFocus}
              className="text-xs font-bold text-muted hover:text-foreground bg-surface border border-border px-3 py-1.5 rounded-lg cursor-pointer"
            >
              Sair do foco
            </button>
          </div>
        )}
        <EditorTitleInput
          chapterNumber={props.chapterNumber}
          title={props.title}
          onChange={props.onTitleChange}
        />
        <EditorCanvas
          contentRef={props.contentRef}
          initialContent={props.initialContent}
          onChange={props.onContentChange}
          fontSizePt={props.fontSizePt}
          fontFamily={props.fontFamily}
          lineHeightRatio={props.lineHeightRatio}
          onSelectionChange={props.onSelectionChange}
        />
        <EditorNav
          bookId={props.bookId}
          prevChapter={props.prevChapter}
          nextChapter={props.nextChapter}
        />
      </div>
    </main>
  );
}
