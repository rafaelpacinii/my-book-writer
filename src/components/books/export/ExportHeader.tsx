import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ExportHeader({ bookId }: { bookId: string }) {
  return (
    <div className="mb-8">
      <Link
        href={`/books/view?bookId=${encodeURIComponent(bookId)}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-foreground mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao livro
      </Link>
      <h1 className="font-serif text-3xl text-foreground">Exportar livro</h1>
      <p className="text-muted mt-2">Exporte seu livro em PDF para impressão ou em EPUB para leitores digitais.</p>
    </div>
  );
}
