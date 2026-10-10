"use client";

import { useLayoutEffect, useRef } from "react";
import { measurePagedContent } from "@/lib/editor/pagedLayout";
import type { PageDimensions } from "@/utils/bookPagination";
import type { PreviewChapter } from "@/types/preview";
import { PreviewChapterFlow } from "./PreviewChapterFlow";

interface Props {
  chapters: PreviewChapter[];
  dim: PageDimensions;
  onCount: (chapterId: string, pages: number) => void;
}

function MeasuredChapter({ chapter, dim, onCount }: Omit<Props, "chapters"> & { chapter: PreviewChapter }) {
  const flowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const flow = flowRef.current;
    const content = contentRef.current;
    if (!flow || !content) return;
    const measure = () => onCount(chapter.id, measurePagedContent(flow, content, dim.widthPx));
    measure();
    void document.fonts.ready.then(measure);
    document.fonts.addEventListener("loadingdone", measure);
    return () => document.fonts.removeEventListener("loadingdone", measure);
  }, [chapter, dim, onCount]);

  return <PreviewChapterFlow chapter={chapter} dim={dim} flowRef={flowRef} contentRef={contentRef} />;
}

/** Invisible, unscaled copy of every chapter used only to count pages. */
export function PreviewMeasurer({ chapters, dim, onCount }: Props) {
  return (
    <div
      aria-hidden="true"
      style={{ fontFamily: dim.fontFamily }}
      className="fixed left-0 top-0 invisible pointer-events-none"
    >
      {chapters.map((chapter) => (
        <MeasuredChapter key={chapter.id} chapter={chapter} dim={dim} onCount={onCount} />
      ))}
    </div>
  );
}

