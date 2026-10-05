"use client";

import type { PagedEditorProps } from "@/types/editor";
import { EditorPagedControls } from "./EditorPagedControls";
import { EditorPagedPaper } from "./EditorPagedPaper";
import { EditorPageLayoutInfo } from "./EditorPageLayoutInfo";
import { usePagedEditor } from "./usePagedEditor";

export function EditorPagedSheet(props: PagedEditorProps) {
  const editor = usePagedEditor(props);

  return (
    <main ref={editor.containerRef} className="flex-1 min-h-0 min-w-0 overflow-auto p-4 flex flex-col items-center">
      <EditorPagedControls
        currentPage={editor.currentPage}
        totalPages={editor.totalPages}
        onPageChange={editor.handlePageChange}
        isFitMode={editor.isFitMode}
        scalePercent={Math.round(editor.scale * 100)}
        onSetFit={editor.handleSetFit}
        onReset100={editor.handleReset100}
        onZoomIn={editor.handleZoomIn}
        onZoomOut={editor.handleZoomOut}
        isFocusMode={props.isFocusMode}
        onExitFocus={props.onExitFocus}
      />
      <EditorPagedPaper props={props} editor={editor} />
      <EditorPageLayoutInfo book={props.book} dimensions={editor.dim} />
    </main>
  );
}
