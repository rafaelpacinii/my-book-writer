import Link from "next/link";
import { BookOpen } from "lucide-react";
import { BookSectionCard } from "@/components/books/shared/BookSectionPage";

export function ExportReviewCard({ bookId }: { bookId: string }) {
  const query = `?bookId=${encodeURIComponent(bookId)}`;
  return (
    <BookSectionCard className="lg:col-span-5">
      <h2 className="text-lg font-bold text-foreground">Antes de exportar</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Confira a ordem dos capítulos, as páginas iniciais e a apresentação do livro.
      </p>
      <Link href={`/books/preview${query}`}
        className="my-5 inline-flex min-h-11 items-center gap-2 rounded-lg border border-control-border px-4 text-sm font-semibold text-foreground hover:bg-surface-hover"
      >
        <BookOpen className="h-4 w-4" />Ver livro completo
      </Link>
      <div className="flex flex-col gap-3 border-t border-border pt-5 text-sm">
        <Link href={`/books/front-matter${query}`} className="text-primary hover:underline">Ajustar páginas iniciais</Link>
        <Link href={`/books/settings${query}`} className="text-primary hover:underline">Ajustar configurações do livro</Link>
      </div>
    </BookSectionCard>
  );
}
