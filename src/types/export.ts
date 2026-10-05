export interface PdfExportInfo {
  title: string;
  author: string;
  format_name: string;
  font_name: string;
  chapter_count: number;
  available: boolean;
  unavailable_reason: string | null;
}

export interface PdfExportResult {
  path: string;
}
