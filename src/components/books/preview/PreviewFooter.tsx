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
    <footer className="h-10 px-6 border-t border-border bg-surface flex items-center justify-between gap-4 shrink-0 select-none">
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
