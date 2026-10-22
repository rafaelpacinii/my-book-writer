import { BookSectionHeader } from "@/components/books/shared/BookSectionHeader";

export function SettingsHeader({ bookId, bookTitle }: { bookId: string; bookTitle: string }) {
  return (
    <BookSectionHeader bookId={bookId} bookTitle={bookTitle} current="Configurações"
      title="Configurações do livro" description="Ajuste os detalhes e a apresentação da sua obra." />
  );
}
