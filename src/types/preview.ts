import type { ChapterType } from "./chapter";

export interface PreviewChapter {
  id: string;
  number: string;
  title: string;
  chapter_type?: ChapterType;
  custom_type_name?: string | null;
  /** Sanitized HTML, safe to render read-only. */
  html: string;
  words: number;
}

