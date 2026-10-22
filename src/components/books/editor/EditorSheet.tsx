import React from "react";
import { EditorTitleInput } from "./EditorTitleInput";
import { EditorCanvas } from "./EditorCanvas";
import { EditorNav } from "./EditorNav";
import { EditorFocusHeader } from "./EditorFocusHeader";
import { useContinuousZoom } from "./useContinuousZoom";
import type { ChapterSummary } from "@/types/chapter";

interface Props {
  chapterNumber: string;
  title: string;
  onTitleChange: (v: string) => void;
  contentRef: React.RefObject<HTMLDivElement | null>;
  initialContent: string;
  onContentChange: (v: string) => void;
  onSelectionChange?: () => void;
  bookId: string;
  prevChapter: ChapterSummary | null;
  nextChapter: ChapterSummary | null;
  isFocusMode: boolean;
  onExitFocus: () => void;
}

export function EditorSheet(props: Props) {
  const { zoomScale } = useContinuousZoom();

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden relative">
      {props.isFocusMode && (
        <EditorFocusHeader title={props.title} onExitFocus={props.onExitFocus} />
      )}
      <section aria-label="Área de escrita" className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center">
        <div
          style={{
            transform: zoomScale !== 1 ? `scale(${zoomScale})` : undefined,
            transformOrigin: "top center",
          }}
          className="w-full max-w-[720px] flex-1 flex flex-col transition-transform duration-100"
        >
          <EditorTitleInput
            chapterNumber={props.chapterNumber}
            title={props.title}
            onChange={props.onTitleChange}
          />
          <EditorCanvas
            contentRef={props.contentRef}
            initialContent={props.initialContent}
            onChange={props.onContentChange}
            onSelectionChange={props.onSelectionChange}
          />
          <EditorNav
            bookId={props.bookId}
            prevChapter={props.prevChapter}
            nextChapter={props.nextChapter}
          />
        </div>
      </section>
    </div>
  );
}
