import { useRef } from "react";
import type { PagedEditorProps } from "@/types/editor";
import { usePagedCaret } from "@/hooks/usePagedCaret";
import type { usePagedEditor } from "./usePagedEditor";
import { EditorPagedFlow } from "./EditorPagedFlow";
import { EditorPagedCaret } from "./EditorPagedCaret";

interface Props {
  props: PagedEditorProps;
  editor: ReturnType<typeof usePagedEditor>;
}

export function EditorPagedPaper({ props, editor: ed }: Props) {
  const dim = ed.dim;
  const paperRef = useRef<HTMLDivElement>(null);
  const caret = usePagedCaret(props.contentRef, paperRef, ed.currentPage, ed.scale);

  return (
    <div style={{ width: dim.widthPx * ed.scale, height: dim.heightPx * ed.scale }} className="relative shrink-0">
      <div
        ref={paperRef}
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
        <EditorPagedFlow props={props} editor={ed} hasCaret={Boolean(caret)} />
        <EditorPagedCaret position={caret} />
        <div style={{ height: dim.runningMatterHeightPx }} className="text-center text-[10px] pt-2 select-none">
          {ed.currentPage}
        </div>
      </div>
    </div>
  );
}
