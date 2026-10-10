import { BookOpen, FileCheck, FileText } from "lucide-react";
import type { ExportFormat } from "@/types/export";

interface Props {
  format: ExportFormat;
  onChange: (format: ExportFormat) => void;
}

export function ExportFormatSelector({ format, onChange }: Props) {
  const item = "flex-1 p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3";
  const active = "border-primary bg-primary-soft/40 shadow-xs";
  const idle = "border-border bg-surface hover:bg-surface-hover text-muted";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6" role="tablist" aria-label="Formato de exportação">
      <button
        type="button" role="tab" aria-selected={format === "pdf"} onClick={() => onChange("pdf")}
        className={`${item} ${format === "pdf" ? active : idle}`}
      >
        <div className={`p-2 rounded-lg ${format === "pdf" ? "bg-primary text-primary-foreground" : "bg-muted/10 text-foreground"}`}>
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <span className="block text-sm font-bold text-foreground">PDF</span>
          <span className="block text-xs text-muted mt-0.5">Layout fixo / impressão</span>
        </div>
      </button>

      <button
        type="button" role="tab" aria-selected={format === "epub"} onClick={() => onChange("epub")}
        className={`${item} ${format === "epub" ? active : idle}`}
      >
        <div className={`p-2 rounded-lg ${format === "epub" ? "bg-primary text-primary-foreground" : "bg-muted/10 text-foreground"}`}>
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <span className="block text-sm font-bold text-foreground">EPUB</span>
          <span className="block text-xs text-muted mt-0.5">eBooks e leitores</span>
        </div>
      </button>

      <button
        type="button" role="tab" aria-selected={format === "docx"} onClick={() => onChange("docx")}
        className={`${item} ${format === "docx" ? active : idle}`}
      >
        <div className={`p-2 rounded-lg ${format === "docx" ? "bg-primary text-primary-foreground" : "bg-muted/10 text-foreground"}`}>
          <FileCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="block text-sm font-bold text-foreground">DOCX</span>
          <span className="block text-xs text-muted mt-0.5">Word e revisão</span>
        </div>
      </button>
    </div>
  );
}
