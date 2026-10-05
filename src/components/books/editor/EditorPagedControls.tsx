"use client";

import { EditorPagedNavigation } from "./EditorPagedNavigation";
import { EditorPagedZoomControls } from "./EditorPagedZoomControls";

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isFitMode: boolean;
  scalePercent: number;
  onSetFit: () => void;
  onReset100: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isFocusMode: boolean;
  onExitFocus: () => void;
}

export function EditorPagedControls(props: Props) {
  return (
    <div className="w-full max-w-2xl flex flex-wrap items-center justify-between gap-2 mb-3 text-xs text-muted select-none">
      <EditorPagedNavigation {...props} />
      <EditorPagedZoomControls {...props} />
    </div>
  );
}
