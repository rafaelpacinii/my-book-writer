import { BookSectionHeader } from "@/components/books/shared/BookSectionHeader";

export function ExportHeader({ bookId, bookTitle }: { bookId: string; bookTitle?: string }) {
  return (
    <BookSectionHeader bookId={bookId} bookTitle={bookTitle} current="Exportar"
      title="Exportar livro" description="Escolha PDF para impressão, EPUB para leitores digitais ou DOCX para revisão." />
  );
}
