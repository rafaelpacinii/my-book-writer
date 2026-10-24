import { DocxExportCard } from "./DocxExportCard";
import { EpubExportCard } from "./EpubExportCard";
import { PdfExportCard } from "./PdfExportCard";
import { exportUnavailable } from "@/utils/bookExport";
import type { ExportFormat, PdfExportInfo } from "@/types/export";

interface Props {
  info: PdfExportInfo;
  format: ExportFormat;
  pendingFormat: ExportFormat | null;
  onExport: () => void;
}

export function ExportFormatPanel({ info, format, pendingFormat, onExport }: Props) {
  const reason = exportUnavailable(info, format);
  const props = { info, isExporting: pendingFormat === format, disabled: pendingFormat !== null || reason !== null, onExport };
  return (
    <div id="export-format-panel" role="tabpanel" aria-labelledby={`export-format-panel-${format}`} tabIndex={0}>
      {format === "pdf" ? <PdfExportCard {...props} /> : format === "epub" ? <EpubExportCard {...props} /> : <DocxExportCard {...props} />}
      {reason && (!info.desktop_available || (format === "pdf" && !info.available)
        || !info.issues.some((issue) => issue.formats.includes(format))) && (
        <p className="mt-4 text-sm text-muted">{reason}</p>
      )}
    </div>
  );
}
