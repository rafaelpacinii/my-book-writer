"use client";

import { useState } from "react";
import type { PreviewChapter } from "@/types/preview";
import type { ChapterMarker } from "@/utils/previewPages";
import { PreviewScrubberTooltip } from "./PreviewScrubberTooltip";
import { PreviewChapterMarkers } from "./PreviewChapterMarkers";

interface Props {
  page: number;
  totalPages: number;
  chapters: PreviewChapter[];
  markers: ChapterMarker[];
  onPageChange: (page: number) => void;
}

export function PreviewScrubberTrack({ page, totalPages, chapters, markers, onPageChange }: Props) {
  const [hover, setHover] = useState<{ page: number; percent: number } | null>(null);
  const divisor = Math.max(1, totalPages - 1);
  const thumbPercent = totalPages > 1 ? Math.min(100, Math.max(0, ((page - 1) / divisor) * 100)) : 0;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (totalPages <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const target = Math.max(1, Math.min(totalPages, Math.round(1 + fraction * (totalPages - 1))));
    setHover({ page: target, percent: fraction * 100 });
  };

  const hoverMarker = hover ? markers.slice().reverse().find((m) => m.startPage <= hover.page) ?? markers[0] : null;
  const chapterTitle = chapters[hoverMarker?.chapterIndex ?? 0]?.title;

  return (
    <div
      className="relative flex-1 flex items-center h-8 group select-none"
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      {hover && totalPages > 0 && (
        <PreviewScrubberTooltip
          page={hover.page}
          totalPages={totalPages}
          chapterTitle={chapterTitle}
          percent={hover.percent}
        />
      )}
      <div className="relative w-full h-1.5 bg-border rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all duration-75" style={{ width: `${thumbPercent}%` }} />
      </div>
      <PreviewChapterMarkers markers={markers} chapters={chapters} onPageChange={onPageChange} />
      <div
        style={{ left: `${thumbPercent}%` }}
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-primary border-2 border-surface rounded-full shadow pointer-events-none z-10"
      />
      <input
        type="range" min={1} max={Math.max(1, totalPages)} value={page} disabled={totalPages <= 1}
        onChange={(e) => onPageChange(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        aria-label="Barra de progresso de páginas do livro"
      />
    </div>
  );
}
