export interface PreviewChapter {
  id: string;
  number: string;
  title: string;
  /** Sanitized HTML, safe to render read-only. */
  html: string;
  words: number;
}

