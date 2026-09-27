import React from "react";
import Link from "next/link";

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
          <svg className="w-6.5 h-6.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z" />
          </svg>
          <h3 className="font-bold text-xl text-foreground mt-4">Todos os livros</h3>
          <p className="text-sm text-muted mt-1.5">{librarySubtext}</p>
        </div>
        <div className="flex items-center justify-between text-[13px] font-bold text-primary mt-6 group-hover:translate-x-0.5 transition-transform">
          <span>Explorar biblioteca</span>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14 M14 7l5 5-5 5" />
          </svg>
        </div>
      </Link>

      <Link
        href="/books/new"
        className="flex flex-col justify-between p-7 lg:p-8 rounded-xl border border-border bg-surface hover:border-primary/40 transition-all group"
      >
        <div>
          <svg className="w-6.5 h-6.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14 M5 12h14" />
          </svg>
          <h3 className="font-bold text-xl text-foreground mt-4">Novo livro</h3>
          <p className="text-sm text-muted mt-1.5">Uma nova ideia merece seu próprio espaço</p>
        </div>
        <div className="flex items-center justify-between text-[13px] font-bold text-primary mt-6 group-hover:translate-x-0.5 transition-transform">
          <span>Criar meu livro</span>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14 M14 7l5 5-5 5" />
          </svg>
        </div>
      </Link>
    </div>
  );
}
