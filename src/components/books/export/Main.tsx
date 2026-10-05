"use client";

import { AppShell } from "@/components/shared/AppShell";
import { usePdfExport } from "@/hooks/usePdfExport";
import { ExportHeader } from "./ExportHeader";
import { PdfExportCard } from "./PdfExportCard";

export function Main({ bookId }: { bookId: string }) {
  const pdf = usePdfExport(bookId);

  return (
    <AppShell>
      <main className="max-w-3xl mx-auto pb-16">
        <ExportHeader bookId={bookId} />
        {pdf.isLoading && <p role="status" className="text-muted">Carregando o livro…</p>}
        {pdf.info && (
          <PdfExportCard info={pdf.info} isExporting={pdf.isExporting} onExport={() => void pdf.exportPdf()} />
        )}
        {pdf.error && <p role="alert" className="text-danger mt-4">{pdf.error}</p>}
        {pdf.result && (
          <p role="status" className="text-success mt-4 break-words">PDF salvo em: {pdf.result.path}</p>
        )}
      </main>
    </AppShell>
  );
}
