import { useMemo } from "react";
import type { PreviewChapter } from "@/types/preview";
import { getChapterMarkers } from "@/utils/previewPages";
import { PreviewScrubberTrack } from "./PreviewScrubberTrack";

interface Props {
  page: number;
  totalPages: number;
  chapters: PreviewChapter[];
  counts: number[];
  onPageChange: (page: number) => void;
}

export function PreviewScrubber({ page, totalPages, chapters, counts, onPageChange }: Props) {
  const markers = useMemo(() => getChapterMarkers(counts), [counts]);
  const btn = "w-7 h-7 flex items-center justify-center rounded text-sm text-muted hover:text-foreground hover:bg-surface/50 disabled:opacity-30 disabled:pointer-events-none transition-colors";

  return (
    <div className="w-full bg-gradient-to-t from-surface/90 via-surface/60 to-transparent pt-10 pb-3 px-4 flex justify-center select-none">
      <div className="flex items-center gap-3 w-full max-w-2xl">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={btn}
          aria-label="Página anterior"
        >
          ‹
        </button>
        <span className="text-[11px] font-mono text-muted w-6 text-right shrink-0">1</span>
        <PreviewScrubberTrack
          page={page}
          totalPages={totalPages}
          chapters={chapters}
          markers={markers}
          onPageChange={onPageChange}
        />
        <span className="text-[11px] font-mono text-muted w-6 shrink-0">{totalPages || 1}</span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={btn}
          aria-label="Próxima página"
        >
          ›
        </button>
      </div>
    </div>
  );
}
