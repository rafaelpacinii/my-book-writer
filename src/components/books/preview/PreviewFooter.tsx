import type { usePreviewZoom } from "./usePreviewZoom";
import { PreviewFooterMeta } from "./PreviewFooterMeta";
import { PreviewZoomControls } from "./PreviewZoomControls";

interface Props {
  words: number;
  page: number;
  totalPages: number;
  chapterTitle?: string;
  zoom: ReturnType<typeof usePreviewZoom>;
}

export function PreviewFooter(props: Props) {
  return (
    <footer className="flex min-h-10 shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border bg-surface px-4 py-2 select-none">
      <PreviewFooterMeta
        words={props.words}
        page={props.page}
        totalPages={props.totalPages}
        chapterTitle={props.chapterTitle}
      />
      <PreviewZoomControls
        mode={props.zoom.mode}
        scalePercent={props.zoom.scalePercent}
        onFitWidth={props.zoom.fitWidth}
        onFitHeight={props.zoom.fitHeight}
        onReset100={props.zoom.reset100}
        onZoomIn={props.zoom.zoomIn}
        onZoomOut={props.zoom.zoomOut}
      />
    </footer>
  );
}
