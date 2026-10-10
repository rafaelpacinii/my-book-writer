import { BookOpen, FileText } from "lucide-react";
import type { ExportFormat } from "@/types/export";

interface Props {
  format: ExportFormat;
  onChange: (format: ExportFormat) => void;
}

export function ExportFormatSelector({ format, onChange }: Props) {
  const item = "flex-1 p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3";
  const active = "border-primary bg-primary-soft/40 shadow-xs";
  const idle = "border-border bg-surface hover:bg-surface-hover text-muted";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6" role="tablist" aria-label="Formato de exportação">
      <button
        type="button"
        role="tab"
        aria-selected={format === "pdf"}
        onClick={() => onChange("pdf")}
        className={`${item} ${format === "pdf" ? active : idle}`}
      >
        <div className={`p-2.5 rounded-lg ${format === "pdf" ? "bg-primary text-primary-foreground" : "bg-muted/10 text-foreground"}`}>
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <span className="block text-sm font-bold text-foreground">Documento PDF</span>
          <span className="block text-xs text-muted mt-0.5">Diagramação fixa para impressão</span>
        </div>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={format === "epub"}
        onClick={() => onChange("epub")}
        className={`${item} ${format === "epub" ? active : idle}`}
      >
        <div className={`p-2.5 rounded-lg ${format === "epub" ? "bg-primary text-primary-foreground" : "bg-muted/10 text-foreground"}`}>
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <span className="block text-sm font-bold text-foreground">eBook EPUB</span>
          <span className="block text-xs text-muted mt-0.5">Kindle, Kobo, Apple e Google Books</span>
        </div>
      </button>
    </div>
  );
}

