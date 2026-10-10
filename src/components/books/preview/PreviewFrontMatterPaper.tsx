import React from "react";
import type { PageDimensions } from "@/utils/bookPagination";
import type { Book } from "@/types/book";
import type { BookFrontMatter } from "@/types/frontMatter";
import type { FrontMatterPageItem } from "@/utils/frontMatterPages";
import { PreviewHalfTitlePage } from "./PreviewHalfTitlePage";
import { PreviewTitlePage } from "./PreviewTitlePage";
import { PreviewCopyrightPage } from "./PreviewCopyrightPage";
import { PreviewSpecialPage } from "./PreviewSpecialPage";

interface Props {
  dim: PageDimensions;
  scale: number;
  item: FrontMatterPageItem;
  book: Book;
  frontMatter: BookFrontMatter;
}

export function PreviewFrontMatterPaper({ dim, scale, item, book, frontMatter }: Props) {
  return (
    <div style={{ width: dim.widthPx * scale, height: dim.heightPx * scale }} className="relative shrink-0">
      <div
        style={{
          width: dim.widthPx,
          height: dim.heightPx,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          fontFamily: dim.fontFamily,
          padding: `${dim.paddingTopPx}px ${dim.paddingRightPx}px ${dim.paddingBottomPx}px ${dim.paddingLeftPx}px`,
        }}
        className="absolute top-0 left-0 bg-paper text-ink shadow-2xl overflow-hidden"
      >
        {item.kind === "half-title" && <PreviewHalfTitlePage title={book.title} author={book.author_name} />}
        {item.kind === "title-page" && <PreviewTitlePage title={book.title} author={book.author_name} frontMatter={frontMatter} />}
        {item.kind === "copyright" && <PreviewCopyrightPage frontMatter={frontMatter} />}
        {item.kind === "dedication" && <PreviewSpecialPage kind="dedication" text={frontMatter.dedication_text} />}
        {item.kind === "epigraph" && <PreviewSpecialPage kind="epigraph" text={frontMatter.epigraph_text} author={frontMatter.epigraph_author} />}
        {item.kind === "blank" && <PreviewSpecialPage kind="blank" />}
      </div>
    </div>
  );
}

