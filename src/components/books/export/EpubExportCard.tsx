import { BookDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { PdfExportInfo } from "@/types/export";

interface Props {
  info: PdfExportInfo;
  isExporting: boolean;
  disabled: boolean;
  onExport: () => void;
}

export function EpubExportCard({ info, isExporting, disabled, onExport }: Props) {
  return (
    <section>
      <h2 className="text-lg font-bold text-foreground">eBook EPUB</h2>
      <p className="text-muted mt-2">{info.title} · {info.author || "Autor"}</p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 text-sm">
        <div><dt className="text-muted">Padrão</dt><dd className="font-semibold mt-1">EPUB 3 (Reflowable)</dd></div>
        <div><dt className="text-muted">Idioma</dt><dd className="font-semibold mt-1">Português (Brasil)</dd></div>
        <div><dt className="text-muted">Capítulos</dt><dd className="font-semibold mt-1">{info.chapter_count}</dd></div>
        <div><dt className="text-muted">Compatibilidade</dt><dd className="font-semibold mt-1">Kindle, Kobo, Apple Books</dd></div>
      </dl>
      <Button onClick={onExport} disabled={disabled} aria-busy={isExporting}>
        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BookDown className="w-4 h-4 mr-2" />}
        {isExporting ? "Gerando EPUB…" : "Exportar EPUB"}
      </Button>
      <p className="text-xs text-muted mt-4">Escolha onde salvar. O arquivo é gerado nativamente e offline.</p>
    </section>
  );
}

