export interface PdfExportInfo {
  title: string;
  author: string;
  format_name: string;
  font_name: string;
  chapter_count: number;
  available: boolean;
  unavailable_reason: string | null;
  desktop_available: boolean;
  issues: ExportIssue[];
}

export interface ExportIssue {
  code: string;
  message: string;
  chapter_id: string | null;
  formats: ExportFormat[];
}

export interface PdfExportResult {
  path: string;
  warning?: string | null;
}

export interface EpubExportResult {
  path: string;
  warning?: string | null;
}

export interface DocxExportResult {
  path: string;
  warning?: string | null;
}

export type ExportFormat = "pdf" | "epub" | "docx";
