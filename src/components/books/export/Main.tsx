"use client";

import { useState } from "react";
import { BookSectionPage, BookSectionColumns, BookSectionCard } from "@/components/books/shared/BookSectionPage";
import { ErrorState } from "@/components/shared/ErrorState";
import { ExportReviewCard } from "@/components/books/export/ExportReviewCard";
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
    <BookSectionPage>
      <ExportHeader bookId={bookId} bookTitle={pdf.info?.title} />
      {pdf.isLoading && <p role="status" className="text-muted">Carregando o livro…</p>}
      {pdf.info && (
        <BookSectionColumns>
          <BookSectionCard className="min-w-0 lg:col-span-7">
            <ExportFormatSelector format={format} onChange={setFormat} />
            <div id="export-format-panel" role="tabpanel" aria-labelledby={`export-format-panel-${format}`} tabIndex={0}>
              {format === "pdf" && (
                <PdfExportCard info={pdf.info} isExporting={pdf.isExporting} onExport={() => void pdf.exportPdf()} />
              )}
              {format === "epub" && (
                <EpubExportCard info={pdf.info} isExporting={epub.isExporting} onExport={() => void epub.exportEpub()} />
              )}
              {format === "docx" && (
                <DocxExportCard info={pdf.info} isExporting={docx.isExporting} onExport={() => void docx.exportDocx()} />
              )}
            </div>
          </BookSectionCard>
          <ExportReviewCard bookId={bookId} />
        </BookSectionColumns>
      )}
      {error && (pdf.info ? <p role="alert" className="text-danger mt-4">{error}</p> : <ErrorState message={error} onRetry={pdf.reload} />)}
      {result && (
        <p role="status" className="text-success mt-4 break-words">
          Arquivo salvo em: {result.path}
        </p>
      )}
    </BookSectionPage>
  );
}
