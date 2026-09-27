import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

interface Props {
  booksCount: number;
  isFiltered: boolean;
}

export function LibraryHeader({ booksCount, isFiltered }: Props) {
  const subtitle =
    booksCount === 0 && !isFiltered
      ? "Toda biblioteca começa com uma história."
      : isFiltered
        ? "Resultados da sua busca"
        : `${booksCount} ${booksCount === 1 ? "livro" : "livros"} · um universo de possibilidades`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 select-none">
      <div>
        <p className="text-xs font-bold text-primary tracking-wider uppercase mb-1">
          Seu acervo
        </p>
        <h1 className="font-serif text-3xl lg:text-[32px] font-normal text-foreground tracking-tight">
          Biblioteca
        </h1>
        <p className="text-base text-muted font-normal mt-1">
          {subtitle}
        </p>
      </div>

      <Link
        href="/books/new"
        className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-primary text-primary-foreground font-bold text-[13px] hover:opacity-90 transition-opacity shadow-xs shrink-0 self-start sm:self-auto"
      >
        <Plus className="w-4 h-4" strokeWidth={2.2} />
        <span>Novo livro</span>
      </Link>
    </div>
  );
}
