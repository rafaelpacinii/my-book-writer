"use client";

import { BookSectionPage, BookSectionColumns, BookSectionCard } from "@/components/books/shared/BookSectionPage";
import { ErrorState } from "@/components/shared/ErrorState";
import { ExportReviewCard } from "@/components/books/export/ExportReviewCard";
import { useBookExport } from "@/hooks/useBookExport";
import { ExportHeader } from "./ExportHeader";
import { ExportFormatSelector } from "./ExportFormatSelector";
import { ExportFormatPanel } from "./ExportFormatPanel";
import { ExportIssues } from "./ExportIssues";

export function Main({ bookId }: { bookId: string }) {
  const state = useBookExport(bookId);
  return (
    <BookSectionPage>
      <ExportHeader />
      {state.isLoading && <p role="status" className="text-muted">Carregando o livro…</p>}
      {state.info && (
        <BookSectionColumns>
          <BookSectionCard className="min-w-0 lg:col-span-7">
            <ExportFormatSelector format={state.format} onChange={state.setFormat} />
            <ExportIssues bookId={bookId} info={state.info} format={state.format}
              disabled={state.isExporting} onReload={state.reload} />
            <ExportFormatPanel info={state.info} format={state.format} pendingFormat={state.pendingFormat}
              onExport={() => void state.exportBook()} />
          </BookSectionCard>
          <ExportReviewCard bookId={bookId} />
        </BookSectionColumns>
      )}
      {state.error && (state.loadError ? <ErrorState message={state.error} onRetry={state.reload} />
        : <p role="alert" className="mt-4 text-danger">{state.error}</p>)}
      {state.pendingFormat && <p role="status" className="mt-4 text-muted">Preparando exportação {state.pendingFormat.toUpperCase()}…</p>}
      {state.cancelled && <p role="status" className="mt-4 text-muted">Exportação cancelada. Nenhum arquivo foi salvo.</p>}
      {state.result && <p role="status" className="mt-4 break-words text-success">Arquivo salvo em: {state.result.path}</p>}
      {state.result?.warning && <p role="alert" className="mt-2 text-warning">{state.result.warning}</p>}
    </BookSectionPage>
  );
}
