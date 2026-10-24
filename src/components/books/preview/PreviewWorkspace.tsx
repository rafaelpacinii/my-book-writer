"use client";

import { useEffect, useRef } from "react";
import type { usePreviewData } from "./usePreviewData";
import { usePreviewPages } from "./usePreviewPages";
import { chapterStarts } from "@/utils/previewPages";
import { usePreviewZoom } from "./usePreviewZoom";
import { PreviewHeader } from "./PreviewHeader";
import { PreviewToolbar } from "./PreviewToolbar";
import { PreviewToc } from "./PreviewToc";
import { PreviewPaper } from "./PreviewPaper";
import { PreviewFrontMatterPaper } from "./PreviewFrontMatterPaper";
import { PreviewScrubber } from "./PreviewScrubber";
import { PreviewMeasurer } from "./PreviewMeasurer";
import { PreviewFooter } from "./PreviewFooter";

export function PreviewWorkspace({ bookId, data, editorChapterId }: { bookId: string; data: ReturnType<typeof usePreviewData>; editorChapterId: string }) {
  const { book, chapters, dim, frontMatter, frontMatterPages } = data;
  const stageRef = useRef<HTMLElement>(null);
  const zoom = usePreviewZoom(stageRef, dim);
  const pages = usePreviewPages(chapters, frontMatterPages.length);
  const chapter = chapters[pages.location.chapterIndex];
  const activeFm = frontMatterPages[pages.frontMatterIndex];
  const currentTitle = pages.isFrontMatter ? activeFm?.label : chapter?.title;

  useEffect(() => { stageRef.current?.scrollTo({ top: 0 }); }, [pages.page]);

  const tocEntries = chapters.map((c, idx) => ({
    chapter: c,
    startPage: frontMatterPages.length + (chapterStarts(pages.counts)[idx] ?? 0) + 1,
  }));

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <PreviewHeader>
        <PreviewToolbar bookId={bookId} chapterId={editorChapterId} page={pages.page} totalPages={pages.total} onPageChange={pages.goToPage} />
      </PreviewHeader>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <PreviewToc
          frontMatterPages={frontMatterPages} activeFrontMatterIndex={pages.frontMatterIndex}
          onSelectFrontMatter={pages.goToFrontMatter} chapters={chapters}
          activeIndex={pages.location.chapterIndex} onSelect={pages.goToChapter}
          isFrontMatter={pages.isFrontMatter}
        />
        <div className="flex-1 min-h-0 min-w-0 relative flex flex-col group">
          <section aria-label="Páginas do livro" ref={stageRef} className="flex-1 min-h-0 min-w-0 overflow-auto p-4 flex flex-col items-center">
            {pages.ready ? (
              pages.isFrontMatter && activeFm && book && frontMatter ? (
                <PreviewFrontMatterPaper
                  dim={dim} scale={zoom.scale} item={activeFm} book={book}
                  frontMatter={frontMatter} tocEntries={tocEntries} onSelectPage={pages.goToPage}
                />
              ) : chapter ? (
                <PreviewPaper bookTitle={book?.title || "Livro"} chapter={chapter} dim={dim} chapterPage={pages.location.page} bookPage={pages.page} scale={zoom.scale} />
              ) : null
            ) : <p role="status" className="text-muted mt-16">Calculando páginas…</p>}
          </section>
          {pages.ready && (
            <div className="absolute bottom-0 inset-x-0 select-none opacity-0 group-hover:opacity-100 focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-20">
              <PreviewScrubber page={pages.page} totalPages={pages.total} chapters={chapters} counts={pages.counts} onPageChange={pages.goToPage} />
            </div>
          )}
        </div>
      </div>
      <PreviewFooter words={data.words} page={pages.page} totalPages={pages.total} chapterTitle={currentTitle} zoom={zoom} />
      <PreviewMeasurer chapters={chapters} dim={dim} onCount={pages.reportCount} />
    </div>
  );
}
