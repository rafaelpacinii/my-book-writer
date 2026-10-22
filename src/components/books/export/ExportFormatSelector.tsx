import type { ExportFormat } from "@/types/export";
import { BookSectionTabs } from "@/components/books/shared/BookSectionTabs";

const formats = [
  { id: "pdf", label: "PDF" },
  { id: "epub", label: "EPUB" },
  { id: "docx", label: "DOCX" },
] as const;

export function ExportFormatSelector({ format, onChange }: { format: ExportFormat; onChange: (format: ExportFormat) => void }) {
  return <BookSectionTabs items={formats} value={format} onChange={onChange} label="Formato de exportação" panelId="export-format-panel" />;
}
