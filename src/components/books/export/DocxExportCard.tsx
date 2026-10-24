import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { PdfExportInfo } from "@/types/export";

interface Props {
  info: PdfExportInfo;
  isExporting: boolean;
  disabled: boolean;
  onExport: () => void;
}

export function DocxExportCard({ info, isExporting, disabled, onExport }: Props) {
  return (
    <section>
      <h2 className="text-lg font-bold text-foreground">Documento Word (.docx)</h2>
      <p className="text-muted mt-2">{info.title} · {info.author || "Autor"}</p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 text-sm">
        <div><dt className="text-muted">Dimensões da página</dt><dd className="font-semibold mt-1">{info.format_name}</dd></div>
        <div><dt className="text-muted">Tipografia</dt><dd className="font-semibold mt-1">{info.font_name}</dd></div>
        <div><dt className="text-muted">Capítulos</dt><dd className="font-semibold mt-1">{info.chapter_count}</dd></div>
        <div><dt className="text-muted">Compatibilidade</dt><dd className="font-semibold mt-1">Microsoft Word, LibreOffice, Google Docs</dd></div>
      </dl>
      <Button onClick={onExport} disabled={disabled} aria-busy={isExporting}>
        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
        {isExporting ? "Gerando DOCX…" : "Exportar DOCX"}
      </Button>
      <p className="text-xs text-muted mt-4">Usa a diagramação do PDF como referência. O editor de texto pode redistribuir linhas e páginas; atualize os campos do sumário ao abrir.</p>
    </section>
  );
}

