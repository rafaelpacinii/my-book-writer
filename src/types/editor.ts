import type { RefObject } from "react";
import type { Book } from "@/types/book";
import type { BookFormat, FontPreset } from "@/types/catalog";

export interface PagedEditorProps {
  book: Book | null;
  format?: BookFormat;
  font?: FontPreset;
  chapterNumber: string;
  title: string;
  contentRef: RefObject<HTMLDivElement | null>;
  initialContent: string;
  onContentChange: (html: string) => void;
  onSelectionChange?: () => void;
  isFocusMode: boolean;
  onExitFocus: () => void;
  isFitMode: boolean;
  onFitModeChange: (fit: boolean) => void;
}
