import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function PreviewHeader({ bookId, title }: { bookId: string; title: string }) {
  const bookHref = `/books/view?bookId=${encodeURIComponent(bookId)}`;

  return (
    <header className="h-[72px] px-6 border-b border-border bg-surface flex items-center justify-between select-none shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        <Link href={bookHref} aria-label="Voltar ao menu do livro" className="text-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex flex-col min-w-0">
          <span className="text-[13px] font-bold text-foreground truncate">{title || "Sem título"}</span>
          <span className="text-xs text-muted truncate">Livro completo · somente leitura</span>
        </div>
      </div>
      <Link
        href={bookHref}
        className="inline-flex items-center h-11 px-4 rounded-lg border border-control-border bg-surface text-[13px] font-bold text-foreground hover:bg-surface-hover transition-colors"
      >
        Voltar ao livro
      </Link>
    </header>
  );
}

