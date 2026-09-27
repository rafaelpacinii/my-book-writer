import React from "react";
import Link from "next/link";
import { LayoutGrid, Plus, ArrowRight } from "lucide-react";

interface ActionCardsProps {
  booksCount: number;
}

export function ActionCards({ booksCount }: ActionCardsProps) {
  const librarySubtext =
    booksCount > 0
      ? `${booksCount} ${booksCount === 1 ? "livro" : "livros"} no seu espaço`
      : "Sua biblioteca começa aqui";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
      <Link
        href="/library"
        className="flex flex-col justify-between p-7 lg:p-8 rounded-xl border border-border bg-surface hover:border-primary/40 transition-all group"
      >
        <div>
          <LayoutGrid className="w-6.5 h-6.5 text-primary" strokeWidth={1.7} />
          <h3 className="font-bold text-xl text-foreground mt-4">Todos os livros</h3>
          <p className="text-sm text-muted mt-1.5">{librarySubtext}</p>
        </div>
        <div className="flex items-center justify-between text-[13px] font-bold text-primary mt-6 group-hover:translate-x-0.5 transition-transform">
          <span>Explorar biblioteca</span>
          <ArrowRight className="w-5 h-5" strokeWidth={1.8} />
        </div>
      </Link>

      <Link
        href="/books/new"
        className="flex flex-col justify-between p-7 lg:p-8 rounded-xl border border-border bg-surface hover:border-primary/40 transition-all group"
      >
        <div>
          <Plus className="w-6.5 h-6.5 text-primary" strokeWidth={1.8} />
          <h3 className="font-bold text-xl text-foreground mt-4">Novo livro</h3>
          <p className="text-sm text-muted mt-1.5">Uma nova ideia merece seu próprio espaço</p>
        </div>
        <div className="flex items-center justify-between text-[13px] font-bold text-primary mt-6 group-hover:translate-x-0.5 transition-transform">
          <span>Criar meu livro</span>
          <ArrowRight className="w-5 h-5" strokeWidth={1.8} />
        </div>
      </Link>
    </div>
  );
}
