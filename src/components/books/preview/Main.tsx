"use client";

import { PreviewStatus } from "./PreviewStatus";
import { PreviewWorkspace } from "./PreviewWorkspace";
import { usePreviewData } from "./usePreviewData";

export function Main({ bookId }: { bookId: string }) {
  const data = usePreviewData(bookId);

  if (data.isLoading) return <PreviewStatus bookId={bookId} message="Carregando o livro…" />;
  if (data.error) return <PreviewStatus bookId={bookId} message={data.error} isError />;
  if (!data.book) return <PreviewStatus bookId="" message="Livro não encontrado." isError />;
  if (data.chapters.length === 0) {
    return <PreviewStatus bookId={bookId} message="Este livro ainda não tem capítulos para visualizar." />;
  }

  return <PreviewWorkspace bookId={bookId} data={data} />;
}

