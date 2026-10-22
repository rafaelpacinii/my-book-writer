import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

export function ActionCards({ booksCount }: { booksCount?: number }) {
  const librarySubtext = booksCount === undefined
    ? "Suas histórias em um só lugar."
    : `${booksCount} ${booksCount === 1 ? "livro, muitas possibilidades" : "livros, muitas possibilidades"}.`;

  return (
    <div className="grid gap-7 sm:grid-cols-2 sm:gap-8">
      <Link href="/library" className="group border-t border-foreground pt-5">
        <p className="editorial-eyebrow">Seu acervo</p>
        <h2 className="mt-2.5 font-display text-[29px] leading-tight">Todas as suas histórias.</h2>
        <p className="mt-2 text-[11px] leading-relaxed text-muted">{librarySubtext}</p>
        <span className="mt-6 flex items-center justify-between text-[11px]">
          Explorar biblioteca<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
      <Link href="/books/new" className="group border-t border-foreground pt-5">
        <p className="editorial-eyebrow">Uma página em branco</p>
        <h2 className="mt-2.5 font-display text-[29px] leading-tight">Ideias merecem espaço.</h2>
        <p className="mt-2 text-[11px] leading-relaxed text-muted">Comece pelo título. O resto vem com a escrita.</p>
        <span className="mt-6 flex items-center justify-between text-[11px]">
          Criar um livro<Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
        </span>
      </Link>
    </div>
  );
}
