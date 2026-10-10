"use client";

import { useEffect, useRef } from "react";
import type { usePreviewData } from "./usePreviewData";
import { usePreviewPages } from "./usePreviewPages";
import { usePreviewZoom } from "./usePreviewZoom";
import { PreviewHeader } from "./PreviewHeader";
import { PreviewToolbar } from "./PreviewToolbar";
import { PreviewToc } from "./PreviewToc";
import { PreviewPaper } from "./PreviewPaper";
import { PreviewScrubber } from "./PreviewScrubber";
import { PreviewMeasurer } from "./PreviewMeasurer";
import { PreviewFooter } from "./PreviewFooter";

type Data = ReturnType<typeof usePreviewData>;

export function PreviewWorkspace({ bookId, data }: { bookId: string; data: Data }) {
  const { book, chapters, dim } = data;
  const stageRef = useRef<HTMLElement>(null);
  const zoom = usePreviewZoom(stageRef, dim);
  const pages = usePreviewPages(chapters);
  const chapter = chapters[pages.location.chapterIndex];

  useEffect(() => {
    stageRef.current?.scrollTo({ top: 0 });
  }, [pages.page]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      <PreviewHeader bookId={bookId} title={book?.title ?? ""} />
      <PreviewToolbar bookId={bookId} page={pages.page} totalPages={pages.total} onPageChange={pages.goToPage} />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <PreviewToc chapters={chapters} activeIndex={pages.location.chapterIndex} onSelect={pages.goToChapter} />
        <div className="flex-1 min-h-0 min-w-0 relative flex flex-col group">
          <main ref={stageRef} className="flex-1 min-h-0 min-w-0 overflow-auto p-4 flex flex-col items-center">
            {pages.ready && chapter ? (
              <PreviewPaper
                bookTitle={book?.title || "Livro"} chapter={chapter} dim={dim}
                chapterPage={pages.location.page} bookPage={pages.page} scale={zoom.scale}
              />
            ) : (
              <p role="status" className="text-muted mt-16">Calculando páginas…</p>
            )}
          </main>
          {pages.ready && (
            <div className="absolute bottom-0 inset-x-0 select-none opacity-0 group-hover:opacity-100 focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-20">
              <PreviewScrubber
                page={pages.page} totalPages={pages.total}
                chapters={chapters} counts={pages.counts} onPageChange={pages.goToPage}
              />
            </div>
          )}
        </div>
      </div>
      <PreviewFooter
        words={data.words} page={pages.page} totalPages={pages.total}
        chapterTitle={chapter?.title} zoom={zoom}
      />
      <PreviewMeasurer chapters={chapters} dim={dim} onCount={pages.reportCount} />
    </div>
  );
}
