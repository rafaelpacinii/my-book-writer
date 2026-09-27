import React from "react";
import Link from "next/link";
import { BookCoverArtwork } from "./BookCoverArtwork";

export function LibraryEmpty() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-surface rounded-xl border border-border shadow-xs">
      <div className="w-56 h-32 rounded-xl overflow-hidden border border-border mb-6">
        <BookCoverArtwork index={0} />
      </div>

      <h2 className="font-serif text-2xl sm:text-[26px] font-normal text-foreground">
        Sua biblioteca começa aqui.
      </h2>
      <p className="text-sm text-muted mt-2 max-w-sm">
        Dê um nome à sua próxima história.
      </p>

      <div className="mt-6">
        <Link
          href="/books/new"
          className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-primary text-primary-foreground font-bold text-[13px] hover:opacity-90 transition-opacity shadow-xs"
        >
          Criar meu primeiro livro
        </Link>
      </div>
    </div>
  );
}
