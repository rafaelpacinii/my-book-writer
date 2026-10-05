import type { PagedEditorProps } from "@/types/editor";
import type { usePagedEditor } from "./usePagedEditor";
import { EditorPagedCanvas } from "./EditorPagedCanvas";

interface Props {
  props: PagedEditorProps;
  editor: ReturnType<typeof usePagedEditor>;
}

export function EditorPagedPaper({ props, editor: ed }: Props) {
  const dim = ed.dim;

  return (
    <div style={{ width: dim.widthPx * ed.scale, height: dim.heightPx * ed.scale }} className="relative shrink-0">
      <div
        data-paged-paper
        style={{
          width: dim.widthPx, height: dim.heightPx, transform: `scale(${ed.scale})`,
          transformOrigin: "top left", fontFamily: dim.fontFamily,
          padding: `${dim.paddingTopPx}px ${dim.paddingRightPx}px ${dim.paddingBottomPx}px ${dim.paddingLeftPx}px`,
        }}
        className="absolute top-0 left-0 bg-paper text-ink shadow-2xl select-text"
      >
        <div style={{ height: dim.runningMatterHeightPx }} className="text-center text-[9px] tracking-widest uppercase select-none truncate">
          {props.book?.title || "Livro"}
        </div>
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
            />
          </div>
        </div>
        <div style={{ height: dim.runningMatterHeightPx }} className="text-center text-[10px] pt-2 select-none">
          {ed.currentPage}
        </div>
      </div>
    </div>
  );
}
