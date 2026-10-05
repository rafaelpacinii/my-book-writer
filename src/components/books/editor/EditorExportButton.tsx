import { FileDown } from "lucide-react";

interface Props {
  isOpeningExport: boolean;
  onExport: () => void;
}

export function EditorExportButton({ isOpeningExport, onExport }: Props) {
  return (
    <button
      type="button"
      onClick={onExport}
      disabled={isOpeningExport}
      className="inline-flex items-center gap-2 rounded-lg p-2 text-sm font-semibold text-muted hover:text-foreground disabled:opacity-50 cursor-pointer"
      title="Exportar livro em PDF"
    >
      <FileDown className="w-4 h-4" />
      <span>{isOpeningExport ? "Salvando…" : "Exportar"}</span>
    </button>
  );
}
