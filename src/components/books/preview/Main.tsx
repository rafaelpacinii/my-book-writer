"use client";

import { PreviewStatus } from "./PreviewStatus";
import { PreviewWorkspace } from "./PreviewWorkspace";
import { usePreviewData } from "./usePreviewData";

export function Main({ bookId, chapterId = "" }: { bookId: string; chapterId?: string }) {
  const data = usePreviewData(bookId);

  if (data.isLoading) return <PreviewStatus message="Carregando o livro…" />;
  if (data.error) return <PreviewStatus message={data.error} isError />;
  if (!data.book) return <PreviewStatus message="Livro não encontrado." isError />;
  if (data.chapters.length === 0) {
    return <PreviewStatus message="Este livro ainda não tem capítulos para visualizar." />;
  }

  const editorChapterId = data.chapters.find((chapter) => chapter.id === chapterId)?.id || data.chapters[0].id;
  return <PreviewWorkspace bookId={bookId} data={data} editorChapterId={editorChapterId} />;
}

