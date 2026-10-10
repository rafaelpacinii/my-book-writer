import type { PreviewChapter } from "@/types/preview";
import type { ChapterMarker } from "@/utils/previewPages";

interface Props {
  markers: ChapterMarker[];
  chapters: PreviewChapter[];
  onPageChange: (page: number) => void;
}

export function PreviewChapterMarkers({ markers, chapters, onPageChange }: Props) {
  return (
    <>
      {markers.map((marker) => (
        <button
          key={marker.chapterIndex}
          type="button"
          onClick={() => onPageChange(marker.startPage)}
          style={{ left: `${marker.percent}%` }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1 h-3 bg-muted-foreground/40 hover:bg-primary transition-colors rounded-xs cursor-pointer z-10"
          title={`${chapters[marker.chapterIndex]?.title ?? "Capítulo"} (Pág. ${marker.startPage})`}
          aria-label={`Ir para ${chapters[marker.chapterIndex]?.title ?? "Capítulo"}`}
        />
      ))}
    </>
  );
}

