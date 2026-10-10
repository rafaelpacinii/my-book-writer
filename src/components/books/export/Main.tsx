"use client";

import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { usePdfExport } from "@/hooks/usePdfExport";
import { useEpubExport } from "@/hooks/useEpubExport";
import { useDocxExport } from "@/hooks/useDocxExport";
import type { ExportFormat } from "@/types/export";
import { ExportHeader } from "./ExportHeader";
import { ExportFormatSelector } from "./ExportFormatSelector";
import { PdfExportCard } from "./PdfExportCard";
import { EpubExportCard } from "./EpubExportCard";
import { DocxExportCard } from "./DocxExportCard";

export function Main({ bookId }: { bookId: string }) {
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const pdf = usePdfExport(bookId);
  const epub = useEpubExport(bookId, pdf.info?.chapter_count);
  const docx = useDocxExport(bookId, pdf.info?.chapter_count);

  const error = format === "pdf" ? pdf.error : format === "epub" ? epub.error : docx.error;
  const result = format === "pdf" ? pdf.result : format === "epub" ? epub.result : docx.result;

  return (
    <AppShell>
      <main className="max-w-3xl mx-auto pb-16">
        <ExportHeader bookId={bookId} />
        {pdf.isLoading && <p role="status" className="text-muted">Carregando o livro…</p>}
        {pdf.info && (
          <>
            <ExportFormatSelector format={format} onChange={setFormat} />
            {format === "pdf" && (
              <PdfExportCard info={pdf.info} isExporting={pdf.isExporting} onExport={() => void pdf.exportPdf()} />
            )}
            {format === "epub" && (
              <EpubExportCard info={pdf.info} isExporting={epub.isExporting} onExport={() => void epub.exportEpub()} />
            )}
            {format === "docx" && (
              <DocxExportCard info={pdf.info} isExporting={docx.isExporting} onExport={() => void docx.exportDocx()} />
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
