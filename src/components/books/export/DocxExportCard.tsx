import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { PdfExportInfo } from "@/types/export";

interface Props {
  info: PdfExportInfo;
  isExporting: boolean;
  onExport: () => void;
}

export function DocxExportCard({ info, isExporting, onExport }: Props) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <h2 className="text-xl font-semibold text-foreground">Documento Word (.docx)</h2>
      <p className="text-muted mt-2">{info.title} · {info.author || "Autor"}</p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 text-sm">
        <div><dt className="text-muted">Dimensões da página</dt><dd className="font-semibold mt-1">{info.format_name}</dd></div>
        <div><dt className="text-muted">Tipografia</dt><dd className="font-semibold mt-1">{info.font_name}</dd></div>
        <div><dt className="text-muted">Capítulos</dt><dd className="font-semibold mt-1">{info.chapter_count}</dd></div>
        <div><dt className="text-muted">Compatibilidade</dt><dd className="font-semibold mt-1">Microsoft Word, LibreOffice, Google Docs</dd></div>
      </dl>
      {!info.chapter_count && <p className="text-muted mb-4">Adicione pelo menos um capítulo antes de exportar.</p>}
      <Button onClick={onExport} disabled={!info.chapter_count || isExporting}>
        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
        {isExporting ? "Gerando DOCX…" : "Exportar DOCX"}
      </Button>
      <p className="text-xs text-muted mt-4">Mantém o mesmo formato de página, margens, fonte e quebras do livro.</p>
    </section>
  );
}

