import type { Ref } from "react";
import type { PageDimensions } from "@/utils/bookPagination";
import type { PreviewChapter } from "@/types/preview";

interface Props {
  chapter: PreviewChapter;
  dim: PageDimensions;
  /** Zero-based page inside the chapter that should be visible. */
  offsetPage?: number;
  flowRef?: Ref<HTMLDivElement>;
  contentRef?: Ref<HTMLDivElement>;
}

/** Read-only chapter laid out in page-sized columns, same geometry as the editor. */
export function PreviewChapterFlow({ chapter, dim, offsetPage = 0, flowRef, contentRef }: Props) {
  return (
    <div style={{ height: dim.textHeightPx, width: dim.textWidthPx }} className="overflow-hidden">
      <div
        ref={flowRef}
        style={{
          width: dim.textWidthPx, height: dim.textHeightPx,
          columnWidth: dim.textWidthPx, columnGap: dim.widthPx - dim.textWidthPx,
          columnCount: 1, columnFill: "auto",
          transform: `translateX(-${offsetPage * dim.widthPx}px)`,
        }}
      >
        <div className="paged-chapter-heading">
          <span className="block text-[10px] font-bold uppercase tracking-wider mb-1">{chapter.number}</span>
          <h2 className="text-xl font-normal mb-3">{chapter.title}</h2>
        </div>
        <div
          ref={contentRef}
          style={{ fontSize: dim.fontSizePx, lineHeight: dim.lineHeight }}
          className="editor-content editor-content-paged w-full"
          dangerouslySetInnerHTML={{ __html: chapter.html }}
        />
      </div>
    </div>
  );
}

