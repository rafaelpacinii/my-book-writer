"use client";

import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { usePdfExport } from "@/hooks/usePdfExport";
import { useEpubExport } from "@/hooks/useEpubExport";
import type { ExportFormat } from "@/types/export";
import { ExportHeader } from "./ExportHeader";
import { ExportFormatSelector } from "./ExportFormatSelector";
import { PdfExportCard } from "./PdfExportCard";
import { EpubExportCard } from "./EpubExportCard";

export function Main({ bookId }: { bookId: string }) {
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const pdf = usePdfExport(bookId);
  const epub = useEpubExport(bookId, pdf.info?.chapter_count);

  const error = format === "pdf" ? pdf.error : epub.error;
  const result = format === "pdf" ? pdf.result : epub.result;

  return (
    <AppShell>
      <main className="max-w-3xl mx-auto pb-16">
        <ExportHeader bookId={bookId} />
        {pdf.isLoading && <p role="status" className="text-muted">Carregando o livro…</p>}
        {pdf.info && (
          <>
            <ExportFormatSelector format={format} onChange={setFormat} />
            {format === "pdf" ? (
              <PdfExportCard info={pdf.info} isExporting={pdf.isExporting} onExport={() => void pdf.exportPdf()} />
            ) : (
              <EpubExportCard info={pdf.info} isExporting={epub.isExporting} onExport={() => void epub.exportEpub()} />
            )}
          </>
        )}
        {error && <p role="alert" className="text-danger mt-4">{error}</p>}
        {result && (
          <p role="status" className="text-success mt-4 break-words">
            Arquivo salvo em: {result.path}
          </p>
        )}
      </main>
    </AppShell>
  );
}
