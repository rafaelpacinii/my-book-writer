import type { PageDimensions } from "@/utils/bookPagination";
import type { PreviewChapter } from "@/types/preview";
import { PreviewChapterFlow } from "./PreviewChapterFlow";

interface Props {
  bookTitle: string;
  chapter: PreviewChapter;
  dim: PageDimensions;
  /** Page inside the chapter (1-based). */
  chapterPage: number;
  /** Page number printed in the footer. */
  bookPage: number;
  scale: number;
}

export function PreviewPaper({ bookTitle, chapter, dim, chapterPage, bookPage, scale }: Props) {
  return (
    <div style={{ width: dim.widthPx * scale, height: dim.heightPx * scale }} className="relative shrink-0">
      <div
        style={{
          width: dim.widthPx, height: dim.heightPx, transform: `scale(${scale})`,
          transformOrigin: "top left", fontFamily: dim.fontFamily,
          padding: `${dim.paddingTopPx}px ${dim.paddingRightPx}px ${dim.paddingBottomPx}px ${dim.paddingLeftPx}px`,
        }}
        className="absolute top-0 left-0 bg-paper text-ink shadow-2xl select-text"
      >
        <div style={{ height: dim.runningMatterHeightPx }} className="text-center text-[9px] tracking-widest uppercase select-none truncate">
          {bookTitle}
        </div>
        <PreviewChapterFlow chapter={chapter} dim={dim} offsetPage={chapterPage - 1} />
        <div style={{ height: dim.runningMatterHeightPx }} className="text-center text-[10px] pt-2 select-none">
          {bookPage}
        </div>
      </div>
    </div>
  );
}

