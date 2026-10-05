import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { PdfExportInfo } from "@/types/export";

interface Props {
  info: PdfExportInfo;
  isExporting: boolean;
  onExport: () => void;
}

export function PdfExportCard({ info, isExporting, onExport }: Props) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6">
      <h2 className="text-xl font-semibold text-foreground">PDF</h2>
      <p className="text-muted mt-2">{info.title} · {info.author || "Autor"}</p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 text-sm">
        <div><dt className="text-muted">Formato</dt><dd className="font-semibold mt-1">{info.format_name}</dd></div>
        <div><dt className="text-muted">Fonte</dt><dd className="font-semibold mt-1">{info.font_name}</dd></div>
        <div><dt className="text-muted">Capítulos</dt><dd className="font-semibold mt-1">{info.chapter_count}</dd></div>
      </dl>
      {info.unavailable_reason && <p className="text-muted mb-4">{info.unavailable_reason}</p>}
      {!info.chapter_count && <p className="text-muted mb-4">Adicione pelo menos um capítulo antes de exportar.</p>}
      <Button onClick={onExport} disabled={!info.available || !info.chapter_count || isExporting}>
        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
        {isExporting ? "Gerando PDF…" : "Exportar PDF"}
      </Button>
      <p className="text-xs text-muted mt-4">Escolha onde salvar. A exportação funciona offline.</p>
    </section>
  );
}
