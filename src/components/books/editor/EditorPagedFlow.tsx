import type { PagedEditorProps } from "@/types/editor";
import type { usePagedEditor } from "./usePagedEditor";
import { EditorPagedCanvas } from "./EditorPagedCanvas";

interface Props {
  props: PagedEditorProps;
  editor: ReturnType<typeof usePagedEditor>;
  hasCaret: boolean;
}

export function EditorPagedFlow({ props, editor: ed, hasCaret }: Props) {
  const dim = ed.dim;

  return (
    <div style={{ height: dim.textHeightPx, width: dim.textWidthPx }} className="overflow-hidden">
      <div
        ref={ed.flowRef}
        data-paged-flow
        style={{
          width: dim.textWidthPx, height: dim.textHeightPx,
          columnWidth: dim.textWidthPx, columnGap: dim.widthPx - dim.textWidthPx,
          columnCount: 1, columnFill: "auto",
          transform: `translateX(-${(ed.currentPage - 1) * dim.widthPx}px)`,
        }}
      >
        <div className="paged-chapter-heading select-none" aria-hidden="true">
          <span className="block text-[10px] font-bold uppercase tracking-wider mb-1">{props.chapterNumber}</span>
          <h2 className="text-xl font-normal mb-3">{props.title}</h2>
        </div>
        <EditorPagedCanvas
          contentRef={props.contentRef}
          initialContent={props.initialContent}
          onChange={ed.handleContentChange}
          onSelectionChange={props.onSelectionChange}
          fontSizePx={dim.fontSizePx}
          lineHeight={dim.lineHeight}
          hasCaret={hasCaret}
        />
      </div>
    </div>
  );
}
